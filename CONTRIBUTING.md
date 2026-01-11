# Contributing to @tradmangh/windy-api-client

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tradmangh/windy-api-client.git
   cd windy-api-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the code

3. Ensure your code follows the existing style:
   ```bash
   npm run lint
   ```

4. Run type checking:
   ```bash
   npm run typecheck
   ```

5. Add or update tests as needed:
   ```bash
   npm test
   ```

6. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new feature"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md following the Keep a Changelog format
3. Ensure all tests pass
4. Submit a pull request with a clear description of your changes

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Keep functions focused and single-purpose
- Add JSDoc comments for public APIs

## Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Aim for high test coverage
- Test both success and error cases
- Use descriptive test names

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the code
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
