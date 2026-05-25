# Gemma CLI

[![Gemma CLI CI](https://github.com/BWS1900/gemma-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/BWS1900/gemma-cli/actions/workflows/ci.yml)
[![Gemma CLI E2E (Chained)](https://github.com/BWS1900/gemma-cli/actions/workflows/chained_e2e.yml/badge.svg)](https://github.com/BWS1900/gemma-cli/actions/workflows/chained_e2e.yml)
[![Version](https://img.shields.io/npm/v/@gemma/gemma-cli)](https://www.npmjs.com/package/@gemma/gemma-cli)
[![License](https://img.shields.io/github/license/BWS1900/gemma-cli)](https://github.com/BWS1900/gemma-cli/blob/main/LICENSE)
[![View Code Wiki](https://assets.codewiki.google/readme-badge/static.svg)](https://codewiki.google/github.com/BWS1900/gemma-cli?utm_source=badge&utm_medium=github&utm_campaign=github.com/BWS1900/gemma-cli)

THIS IS AN OPEN SOURCE FORK OF THE GEMINI-CLI COMPATIBLE WITH ANY OPEN AI COMPATIBLE API KEY OR LOCAL MODELS LIKE GEMMA AND IS IN NO WAY AFFILIATED OR ENDORSED BY GOOGLE

THIS IS NOT AN OFFICIAL GOOGLE PRODUCT AND YOU UNDERSTAND THAT ANY USE IS AT YOUR OWN RISK





![Gemma CLI Screenshot](/docs/assets/gemma-screenshot.png)

Gemma CLI is an open-source AI agent that brings the power of Gemini directly
into your terminal. It provides lightweight access to Gemini, giving you the
most direct path from your prompt to our model.

Learn all about Gemma CLI in our [documentation](https://gemmacli.com/docs/).



## 📦 Installation


### Quick Install

#### Run instantly with npx

```bash
# Using npx (no installation required)
npx @gemma/gemma-cli
```

#### Install globally with npm

```bash
npm install -g @gemma/gemma-cli
```

#### Install globally with Homebrew (macOS/Linux)

```bash
brew install gemma-cli
```

#### Install globally with MacPorts (macOS)

```bash
sudo port install gemma-cli
```

#### Install with Anaconda (for restricted environments)

```bash
# Create and activate a new environment
conda create -y -n gemma_env -c conda-forge nodejs
conda activate gemma_env

# Install Gemma CLI globally via npm (inside the environment)
npm install -g @gemma/gemma-cli
```






## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
gemma
```

#### Include multiple directories

```bash
gemma --include-directories ../lib,../docs
```

#### Use specific model

```bash
gemma -m gemma-2.5-flash
```

#### Non-interactive mode for scripts

Get a simple text response:

```bash
gemma -p "Explain the architecture of this codebase"
```

For more advanced scripting, including how to parse JSON and handle errors, use
the `--output-format json` flag to get structured output:

```bash
gemma -p "Explain the architecture of this codebase" --output-format json
```

For real-time event streaming (useful for monitoring long-running operations),
use `--output-format stream-json` to get newline-delimited JSON events:

```bash
gemma -p "Run tests and deploy" --output-format stream-json
```

### Quick Examples

#### Start a new project

```bash
cd new-project/
gemma
> Write me a Discord bot that answers questions using a FAQ.md file I will provide
```

#### Analyze existing code

```bash
git clone https://github.com/BWS1900/gemma-cli
cd gemma-cli
gemma
> Give me a summary of all of the changes that went in yesterday
```

## 📚 Documentation

See official Gemini-CLI Documentation.


### Using MCP Servers

Configure MCP servers in `~/.gemma/settings.json` to extend Gemma CLI with
custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```


## 🤝 Contributing

We welcome contributions! Gemma CLI is fully open source (Apache 2.0), and we
encourage the community to:

- Report bugs and suggest features.
- Improve documentation.
- Submit code improvements.
- Share your MCP servers and extensions.





### Uninstall

See the Official Gemini-CLI for details.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)




<p align="center">
  Forked with ❤️ by the open source community
</p>
