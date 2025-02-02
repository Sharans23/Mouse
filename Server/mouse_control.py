import sys
import logging
from pynput.mouse import Controller, Button

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize mouse controller
mouse = Controller()

def validate_arguments():
    """Validate command line arguments"""
    if len(sys.argv) < 2:
        raise ValueError("No command provided")
    
    command = sys.argv[1].lower()
    if command not in ["move", "click"]:
        raise ValueError(f"Invalid command: {command}")
    
    if command == "move" and len(sys.argv) != 4:
        raise ValueError("Move command requires X and Y coordinates")
    
    if command == "click" and len(sys.argv) != 3:
        raise ValueError("Click command requires button type (left/right)")
    
    return command

def move_mouse(x: float, y: float):
    """Handle mouse movement"""
    try:
        x, y = float(x), float(y)
        current_x, current_y = mouse.position
        
        # Calculate relative movement
        relative_x = x - current_x
        relative_y = y - current_y
        
        logger.info(f"Moving mouse from ({current_x}, {current_y}) to ({x}, {y})")
        mouse.move(relative_x, relative_y)
        
    except ValueError as e:
        logger.error(f"Invalid coordinates: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error moving mouse: {e}")
        sys.exit(1)

def click_mouse(button_type: str):
    """Handle mouse clicks"""
    try:
        button = Button.left if button_type.lower() == "left" else Button.right
        logger.info(f"Clicking {button_type} button")
        mouse.click(button)
        
    except Exception as e:
        logger.error(f"Error clicking mouse: {e}")
        sys.exit(1)

def main():
    try:
        logger.info(f"Starting mouse control with arguments: {sys.argv[1:]}")
        
        command = validate_arguments()
        
        if command == "move":
            move_mouse(sys.argv[2], sys.argv[3])
        elif command == "click":
            click_mouse(sys.argv[2])
            
        logger.info("Command executed successfully")
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()