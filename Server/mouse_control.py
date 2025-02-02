import sys
from pynput.mouse import Controller, Button

mouse = Controller()

print("Python script started.")  # Debugging log
print("Received arguments:", sys.argv)  # Show received command

command = sys.argv[1]  # "move" or "click"

if command == "move":
    x, y = float(sys.argv[2]), float(sys.argv[3])
    print(f"Moving mouse to: {x}, {y}")  # Debugging log
    mouse.position = (x, y)  # ✅ Moves to an absolute position

elif command == "click":
    button = Button.left if sys.argv[2] == "left" else Button.right
    print(f"Clicking {button}")  # Debugging log
    mouse.click(button)
