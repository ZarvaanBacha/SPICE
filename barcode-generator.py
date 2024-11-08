import barcode
from barcode.writer import ImageWriter
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
import random
import os
import math

def mm_to_points(mm_value):
    return mm_value * 2.83465  # Convert mm to points (1 mm = 2.83465 points)

def generate_barcode(code, width_mm, height_mm, path="barcodes"):
    if not os.path.exists(path):
        os.makedirs(path)

    # Calculate DPI needed to achieve desired size
    dpi = 300
    width_pixels = int((width_mm / 25.4) * dpi)
    height_pixels = int((height_mm / 25.4) * dpi)

    barcode_class = barcode.get_barcode_class('code128')
    my_barcode = barcode_class(code, writer=ImageWriter())
    filename = os.path.join(path, code)

    options = {
        "module_width": width_pixels / (len(code) * 11),
        "module_height": height_pixels * 0.8,
        "quiet_zone": 1,
        "font_size": 10,
        "text_distance": 1
    }
    
    try:
        my_barcode.save(filename, options)
    except Exception as e:
        print(f"Error generating barcode: {e}")
        return None

    filename_with_extension = f"{filename}.png"
    if os.path.exists(filename_with_extension):
        try:
            img = Image.open(filename_with_extension)
            img = img.resize((width_pixels, height_pixels), Image.LANCZOS)
            img.save(filename_with_extension)
            return filename_with_extension
        except Exception as e:
            print(f"Error resizing barcode: {e}")
            return None
    return None

def calculate_grid_layout(num_barcodes, page_width_mm, page_height_mm, width_mm, height_mm, printer_margin_mm):
    """Calculate optimal grid layout based on page size and number of barcodes"""
    # Available space after margins
    available_width = page_width_mm - (2 * printer_margin_mm)
    available_height = page_height_mm - (2 * printer_margin_mm)
    
    # Calculate maximum possible columns based on width
    max_cols = math.floor(available_width / width_mm)
    
    # Find optimal number of columns (try to make it as square as possible)
    optimal_cols = min(max_cols, math.ceil(math.sqrt(num_barcodes)))
    
    # Calculate rows needed
    rows = math.ceil(num_barcodes / optimal_cols)
    
    return rows, optimal_cols

def generate_barcodes_pdf(width_mm, height_mm, num_barcodes, output_pdf="barcodes.pdf"):
    # Create PDF canvas with A4 size
    c = canvas.Canvas(output_pdf, pagesize=A4)
    page_width, page_height = A4
    page_width_mm = page_width / mm
    page_height_mm = page_height / mm

    # Define margins
    PRINTER_MARGIN_MM = 12.7  # 0.5 inches
    MARGIN_BUFFER_MM = 2
    
    # Calculate grid layout
    rows, cols = calculate_grid_layout(
        num_barcodes, 
        page_width_mm, 
        page_height_mm, 
        width_mm + MARGIN_BUFFER_MM, 
        height_mm + MARGIN_BUFFER_MM,
        PRINTER_MARGIN_MM + MARGIN_BUFFER_MM
    )
    
    # Calculate available space
    available_width_mm = page_width_mm - (2 * (PRINTER_MARGIN_MM + MARGIN_BUFFER_MM))
    available_height_mm = page_height_mm - (2 * (PRINTER_MARGIN_MM + MARGIN_BUFFER_MM))
    
    # Calculate spacing
    h_spacing_mm = (available_width_mm - (cols * width_mm)) / (cols + 1)
    v_spacing_mm = (available_height_mm - (rows * height_mm)) / (rows + 1)
    
    # Draw margin guides
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.setDash([1, 2], 0)
    c.setLineWidth(0.5)
    
    # Draw margin lines
    c.line(PRINTER_MARGIN_MM * mm, (page_height_mm - PRINTER_MARGIN_MM) * mm, 
           (page_width_mm - PRINTER_MARGIN_MM) * mm, (page_height_mm - PRINTER_MARGIN_MM) * mm)
    c.line(PRINTER_MARGIN_MM * mm, PRINTER_MARGIN_MM * mm, 
           (page_width_mm - PRINTER_MARGIN_MM) * mm, PRINTER_MARGIN_MM * mm)
    c.line(PRINTER_MARGIN_MM * mm, PRINTER_MARGIN_MM * mm, 
           PRINTER_MARGIN_MM * mm, (page_height_mm - PRINTER_MARGIN_MM) * mm)
    c.line((page_width_mm - PRINTER_MARGIN_MM) * mm, PRINTER_MARGIN_MM * mm, 
           (page_width_mm - PRINTER_MARGIN_MM) * mm, (page_height_mm - PRINTER_MARGIN_MM) * mm)

    # Generate and place barcodes
    for i in range(num_barcodes):
        row = i // cols
        col = i % cols
        
        # Calculate position with even spacing
        x_pos = PRINTER_MARGIN_MM + MARGIN_BUFFER_MM + h_spacing_mm + col * (width_mm + h_spacing_mm)
        y_pos = page_height_mm - (PRINTER_MARGIN_MM + MARGIN_BUFFER_MM + v_spacing_mm + 
                                row * (height_mm + v_spacing_mm) + height_mm)
        
        # Generate random barcode
        code = str(random.randint(100000000000, 999999999999))
        barcode_file = generate_barcode(code, width_mm, height_mm)
        
        if barcode_file:
            x_points = x_pos * mm
            y_points = y_pos * mm
            width_points = width_mm * mm
            height_points = height_mm * mm
            c.drawImage(barcode_file, x_points, y_points, width=width_points, height=height_points)

    # Add metadata
    c.setTitle("Barcodes Grid")
    c.setAuthor("Barcode Generator")
    c.setSubject(f"Grid of {num_barcodes} Code128 Barcodes")
    
    c.save()
    
    # Print layout information
    print(f"\nPDF saved as {output_pdf}")
    print(f"Grid layout: {rows} rows × {cols} columns")
    print(f"Horizontal spacing: {h_spacing_mm:.1f}mm")
    print(f"Vertical spacing: {v_spacing_mm:.1f}mm")
    print(f"Total grid size: {cols * width_mm + (cols - 1) * h_spacing_mm:.1f}mm × "
          f"{rows * height_mm + (rows - 1) * v_spacing_mm:.1f}mm")

if __name__ == "__main__":
    try:
        width_mm = float(input("Enter the width of each barcode (in mm): "))
        height_mm = float(input("Enter the height of each barcode (in mm): "))
        num_barcodes = int(input("Enter the number of barcodes to generate: "))
        
        if width_mm <= 0 or height_mm <= 0 or num_barcodes <= 0:
            raise ValueError("Width, height, and number of barcodes must be positive numbers")
        
        # Calculate maximum barcodes that can fit on page
        page_width_mm = A4[0] / mm
        page_height_mm = A4[1] / mm
        rows, cols = calculate_grid_layout(
            num_barcodes,
            page_width_mm,
            page_height_mm,
            width_mm + 2,  # Add buffer
            height_mm + 2,  # Add buffer
            12.7 + 2  # Printer margin + buffer
        )
        
        max_per_page = rows * cols
        if num_barcodes > max_per_page:
            raise ValueError(
                f"Too many barcodes for page size.\n"
                f"Maximum barcodes per page with current dimensions: {max_per_page}\n"
                f"Consider reducing barcode size or using multiple pages."
            )
        
        generate_barcodes_pdf(width_mm, height_mm, num_barcodes)
        
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")