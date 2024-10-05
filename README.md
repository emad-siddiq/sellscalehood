# SellScaleHood

## Getting Started

Prereqs: Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sellscalehood.git
   cd sellscalehood
   ```

2. Start the application:
   - For development/debug mode:
     ```
     ./scripts/debug.sh
     ```
   - For production mode:
     ```
     ./scripts/production.sh
     ```

3. Access the application:
   - Development mode:
     - Frontend: http://localhost:3000
     - Backend API: http://localhost:5001
   - Production mode:
     - Frontend: http://localhost
     - Backend API: http://localhost:5001

Note: Make sure to make the scripts executable with `chmod +x scripts/debug.sh scripts/production.sh`.

## Debugging

1. Ensure you're running the application in debug mode using `./scripts/debug-mode.sh`.

2. Open the project in VSCode.

3. Install the "JavaScript Debugger" extension if you haven't already.

4. Set breakpoints in your code as needed.

5. Go to the Run and Debug view in VSCode (Ctrl+Shift+D or Cmd+Shift+D).

6. Select "Full Stack: Flask + React" from the dropdown and click the green play button or press F5.

7. The debugger should now be attached to both your frontend and backend.

## Stopping the Application

To stop the application and remove the containers:

```
docker-compose down
```

To stop the application and remove the containers, volumes, and images:

```
docker-compose down -v --rmi all
```

## Rebuilding After Changes

If you make changes to the code or dependencies, you will need to rebuild the Docker images:

```
docker-compose build
```

Then start the application again using either `./scripts/debug.sh` or `./scripts/production.sh`.

