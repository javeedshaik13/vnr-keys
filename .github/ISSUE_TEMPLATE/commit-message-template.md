# Commit Message Template

Use this template to create well-structured commit messages that include issue references and proper descriptions.

## 📝 Commit Message Format

```
<type>(<scope>): <description>

<body>

<footer>
```

## 🏷️ Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

## 🔗 Issue References

Always include issue references in your commit messages:

```
feat(auth): add email verification system

- Implement email verification flow
- Add verification token generation
- Update user model with verification status

Closes #123
Fixes #124
Related to #125
```

## 📋 Examples

### Feature with Issue Reference
```
feat(dashboard): implement user activity tracking

- Add activity log component
- Track user actions and timestamps
- Display activity history in dashboard

Closes #45
```

### Bug Fix with Multiple Issues
```
fix(api): resolve CORS issues and authentication errors

- Fix CORS configuration for production
- Update authentication middleware
- Add proper error handling

Fixes #67, #68
Related to #69
```

### Documentation Update
```
docs(readme): update deployment instructions

- Add CI/CD setup guide
- Include environment variables documentation
- Update troubleshooting section

Closes #89
```

## 🎯 Best Practices

1. **Use present tense**: "add feature" not "added feature"
2. **Use imperative mood**: "move cursor to..." not "moves cursor to..."
3. **Limit first line to 50 characters**
4. **Separate subject from body with blank line**
5. **Wrap body at 72 characters**
6. **Use footer to reference issues**

## 🔍 Issue Reference Formats

- `Closes #123` - Closes the issue
- `Fixes #123` - Fixes the issue
- `Resolves #123` - Resolves the issue
- `Related to #123` - Related to the issue
- `Addresses #123` - Addresses the issue

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Issue References](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-issues/linking-a-pull-request-to-an-issue)
- [Commit Message Guidelines](https://chris.beams.io/posts/git-commit/)
