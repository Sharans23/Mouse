import sys
from pynput.mouse import Controller, Button

mouse = Controller()

command = sys.argv[1]  # "move" or "click"

if command == "move":
    x, y = float(sys.argv[2]), float(sys.argv[3])
    mouse.move(x, y)  # Moves relative to the current position

elif command == "click":
    button = Button.left if sys.argv[2] == "left" else Button.right
    mouse.click(button)
