import os
import sys

def check_env():
    """Checks for the existence of the .env file in the current directory."""
    if os.path.exists(".env"):
        print("[SUCCESS] .env file found.")
    else:
        print("[ERROR] .env file NOT found.")
        sys.exit(1)

def main():
    print("Executing initialization check...")
    check_env()
    print("Execution layer is functional.")

if __name__ == "__main__":
    main()
