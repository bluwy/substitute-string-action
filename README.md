# substitute-string-action

A GitHub Action to easily substitute or replace strings from a text or a file.

## Usage

The simplest usage can be configured as below:

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: BjornLuG/substitute-string-action
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
      - uses: BjornLuG/substitute-string-action
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

## License

MIT
