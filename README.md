# substitute-string-action

A GitHub Action to easily substitute or replace strings from a text or a file using YAML!

## Usage

The simplest usage can be configured as below:

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: bluwy/substitute-string-action@v1
      id: sub
      with:
        _input-text: 'Hello World!'
        World: GitHub
    - run: echo ${{ steps.sub.outputs.result }} # Prints 'Hello GitHub!'
```

See the [examples](#examples) below for more use cases.

## Parameters

#### `_input-text`

**Optional** The plain input text.

#### `_input-file`

**Optional** The file to read as input.

> You must specify either `_input-text` or `_input-file`, otherwise it will throw an error. If both are specified, `_input-text` will take precendence.

#### `_output-file`

**Optional** The file to write after substitution.

#### `_format-key`

**Optional** Formats a key before replacing. Use the word `key` to refer to the substitute key. It's easier to understand with examples, like below:

For example:

1. Format key with `%%` prefix and suffix.

- `_input-text: 'Hello human, %%human%%'`
- `_format-key: '%%key%%'`
- `human: 'Bob'`
- Result: 'Hello human, Bob'

2. No key format.

- `_input-text: 'Hello human, human'`
- `human: 'Bob'`
- Result: 'Hello Bob, Bob'

#### `[keys]`

**Optional**  The keys to be substituted with its value.

> Note: The keys are case-insensitive, meaning foo can be matched to `Foo`, `FOO`, etc... This is a caveat of GitHub Action's way of handling inputs.

## Examples

Send tweet via a template with [`ethomson/send-tweet-action`](https://github.com/ethomson/send-tweet-action):

**.github/tweet_template.txt**:
```
🎉️ My-awesome-project %%version%% has been released! 🎉️

View the release at https://example.com
```

**release.yml**
```yml
name: Send a Tweet
on:
  release:
    types: [published]
jobs:
  tweet:
    runs-on: ubuntu-latest
    steps:
      - uses: bluwy/substitute-string-action@v1
        id: sub
        with:
          _input-file: './.github/tweet_template.txt'
          _format-key: '%%key%%'
          version: ${{ github.ref }}
      - uses: ethomson/send-tweet-action@v1
        with:
          status: ${{ steps.sub.outputs.result }}
          consumer-key: ${{ secrets.TWITTER_CONSUMER_API_KEY }}
          consumer-secret: ${{ secrets.TWITTER_CONSUMER_API_SECRET }}
          access-token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          access-token-secret: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
```

## FAQ

#### How is this different than similar existing actions?

There are a few actions out there that allows regex substitutions. While this feature is not supported (yet), this action mainly focuses on providing multiple substitutions at once, which most other actions doesn't support.

The closest action I can find to have this functionaility is [Replace Action](https://github.com/datamonsters/replace-action), but the way it handles multiple substitutions is by defining a comma-separated key-value pair, e.g. `foo=bar,$FOO=Bar_Value`.

This action uses a different approach. By specifying the key and values as parameters of this action, we can take advantage of YAML's styling, extract all the custom parameters and use them for substitutions.

## License

MIT
