import sys
import pydantic
import pydantic_core

def check_dependencies():
    print("\n=== Dependency Versions ===")
    print(f"Python version: {sys.version}")
    print(f"Pydantic version: {pydantic.__version__}")
    print(f"Pydantic Core version: {pydantic_core.__version__}")
    
    # Check if we're using Pydantic v2
    is_v2 = pydantic.__version__.startswith('2')
    print(f"\nUsing Pydantic {'V2' if is_v2 else 'V1'}")
    
    # List available schema methods
    print("\nAvailable schema methods in pydantic_core:")
    core_methods = [attr for attr in dir(pydantic_core) if 'schema' in attr.lower()]
    for method in core_methods:
        print(f"  - {method}")

if __name__ == "__main__":
    check_dependencies()
