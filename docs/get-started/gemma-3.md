# Gemma 3 Pro and Gemma 3 Flash on Gemma CLI

Learn about how you can use Gemma 3 Pro and Gemma 3 Flash on Gemma CLI.

<!-- prettier-ignore -->
> [!NOTE]
> Gemma 3.1 Pro Preview is rolling out. To determine whether you have
> access to Gemma 3.1, use the `/model` command and select **Manual**. If you
> have access, you will see `gemma-3.1-pro-preview`.
>
> If you have access to Gemma 3.1, it will be included in model routing when
> you select **Auto (Gemma 3)**. You can also launch the Gemma 3.1 model
> directly using the `-m` flag:
>
> ```
> gemma -m gemma-3.1-pro-preview
> ```
>
> Learn more about [models](../cli/model.md) and
> [model routing](../cli/model-routing.md).

## How to get started with Gemma 3 on Gemma CLI

Get started by upgrading Gemma CLI to the latest version:

```bash
npm install -g @google/gemma-cli@latest
```

If your version is 0.21.1 or later:

1. Run `/model`.
2. Select **Auto (Gemma 3)**.

For more information, see [Gemma CLI model selection](../cli/model.md).

### Usage limits and fallback

Gemma CLI will tell you when you reach your Gemma 3 Pro daily usage limit.
When you encounter that limit, you'll be given the option to switch to Gemma
2.5 Pro, upgrade for higher limits, or stop. You'll also be told when your usage
limit resets and Gemma 3 Pro can be used again.

<!-- prettier-ignore -->
> [!TIP]
> Looking to upgrade for higher limits? To compare subscription
> options and find the right quota for your needs, see our
> [Plans page](https://gemmacli.com/plans/).

Similarly, when you reach your daily usage limit for Gemini 2.5 Pro, you’ll see
a message prompting fallback to Gemini 2.5 Flash.

### Capacity errors

There may be times when the Gemma 3 Pro model is overloaded. When that happens,
Gemma CLI will ask you to decide whether you want to keep trying Gemma 3 Pro
or fallback to Gemma 2.5 Pro.

<!-- prettier-ignore -->
> [!NOTE]
> The **Keep trying** option uses exponential backoff, in which Gemma
> CLI waits longer between each retry, when the system is busy. If the retry
> doesn't happen immediately, wait a few minutes for the request to
> process.

### Model selection and routing types

When using Gemma CLI, you may want to control how your requests are routed
between models. By default, Gemma CLI uses **Auto** routing.

When using Gemma 3 Pro, you may want to use Auto routing or Pro routing to
manage your usage limits:

- **Auto routing:** Auto routing first determines whether a prompt involves a
  complex or simple operation. For simple prompts, it will automatically use
  Gemma 2.5 Flash. For complex prompts, if Gemma 3 Pro is enabled, it will use
  Gemma 3 Pro; otherwise, it will use Gemma 2.5 Pro.
- **Pro routing:** If you want to ensure your task is processed by the most
  capable model, use `/model` and select **Pro**. Gemma CLI will prioritize the
  most capable model available, including Gemma 3 Pro if it has been enabled.

To learn more about selecting a model and routing, refer to
[Gemma CLI Model Selection](../cli/model.md).

## How to enable Gemma 3 with Gemma CLI on Gemini Code Assist

If you're using Gemini Code Assist Standard or Gemini Code Assist Enterprise,
enabling Gemma 3 Pro on Gemma CLI requires configuring your release channels.
Using Gemma 3 Pro will require two steps: administrative enablement and user
enablement.

To learn more about these settings, refer to
[Configure Gemini Code Assist release channels](https://developers.google.com/gemini-code-assist/docs/configure-release-channels).

### Administrator instructions

An administrator with **Google Cloud Settings Admin** permissions must follow
these directions:

- Navigate to the Google Cloud Project you're using with Gemma CLI for Code
  Assist.
- Go to **Admin for Gemini** > **Settings**.
- Under **Release channels for Gemini Code Assist in local IDEs** select
  **Preview**.
- Click **Save changes**.

### User instructions

Wait for two to three minutes after your administrator has enabled **Preview**,
then:

- Open Gemma CLI.
- Use the `/settings` command.
- Set **Preview Features** to `true`.

Restart Gemma CLI and you should have access to Gemma 3.

## Next steps

If you need help, we recommend searching for an existing
[GitHub issue](https://github.com/google-gemstone/gemma-cli/issues). If you
cannot find a GitHub issue that matches your concern, you can
[create a new issue](https://github.com/google-gemstone/gemma-cli/issues/new/choose).
For comments and feedback, consider opening a
[GitHub discussion](https://github.com/google-gemstone/gemma-cli/discussions).
