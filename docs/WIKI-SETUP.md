# GitHub Wiki Setup Guide

## How to Add Wiki to GitHub

GitHub wikis are stored in a separate Git repository. Follow these steps:

### Method 1: Via GitHub UI (Easiest)

1. Go to your repository on GitHub
2. Click **Wiki** tab
3. Click **Create the first page**
4. Copy content from `docs/wiki/Home.md`
5. Click **Save Page**
6. Repeat for other wiki pages

### Method 2: Via Git Clone

```bash
# Clone the wiki repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.wiki.git
cd YOUR_REPO.wiki

# Copy wiki files
cp -r ../docs/wiki/*.md .

# Commit and push
git add .
git commit -m "Add wiki documentation"
git push origin master
```

### Wiki Pages Structure

| File | Wiki Page Name |
|------|---------------|
| `Home.md` | Home (main page) |
| `Getting-Started.md` | Getting Started |
| `API-Reference.md` | API Reference |
| `Security.md` | Security Features |
| `Deployment.md` | Deployment Guide |
| `Troubleshooting.md` | Troubleshooting |

---

## Update Links

After adding to GitHub Wiki, update internal links:

- Replace `[[Page Name|./path/to/file.md]]` with `[[Page Name]]`
- GitHub Wiki uses `[[Page Name]]` syntax for internal links

---

## Alternative: Use /docs folder

If you prefer not to use GitHub Wiki, the `docs/` folder can serve as documentation:

1. Keep all files in `docs/` folder
2. Link to them directly in README
3. GitHub will render markdown files automatically

---

## Preview Wiki

To preview wiki pages locally:

```bash
# Use any markdown viewer
# VS Code has built-in preview
code docs/wiki/Home.md

# Or use markdown preview tool
npx markdown-preview docs/wiki/Home.md
```
