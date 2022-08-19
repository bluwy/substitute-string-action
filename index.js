import fs from 'fs/promises' 
import path from 'path'
import * as core from '@actions/core'

main().catch((e) => core.setFailed(e.message))

async function main() {
  let inputString = await getInputString()

  if (!inputString) {
    core.info('Input has no text, result will be an empty string')
    await setOutputResult('')
    return
  }

  core.debug(`Input string: \n${inputString}`)

  const inputMap = getInputMap()

  if (!Object.keys(inputMap).length) {
    core.info('No substitutions specified, result will equal to input string')
    await setOutputResult(inputString)
    return
  }

  core.debug(`Substitutions: \n${inputMap}`)

  const formatKey = core.getInput('_format-key') || 'key'

  for (const key in inputMap) {
    const newKey = formatKey.replace('key', key)
    const pattern = new RegExp(escapeRegExp(newKey), 'gi')
    // NOTE: Replace with value in function syntax to prevent special patterns replacement
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
    inputString = inputString.replace(pattern, () => inputMap[key])
  }

  core.debug(`Result string: \n${inputString}`)

  await setOutputResult(inputString)
}

/**
 * Gets string input. Throws error if not input specified.
 * This may return an empty string if input file is empty.
 */
async function getInputString() {
  const inputText = core.getInput('_input-text')
  const inputFile = core.getInput('_input-file')

  if (!inputText && !inputFile) {
    throw new Error('No input specified')
  }

  return inputText || (await fs.readFile(inputFile, 'utf8'))
}

/**
 * Gets an object with key-value of substitutions
 */
function getInputMap() {
  const map = {}

  for (const key in process.env) {
    // GitHub Actions uses INPUT_ prefix for inputs.
    // Inputs with _ character are for internal use
    if (key.startsWith('INPUT_') && key[6] !== '_') {
      const inputKey = key.slice(6)
      map[inputKey] = process.env[key]
    }
  }

  return map
}

/**
 * Sets the output for `outputs.result` and to output file
 * @param {string} result Final output string
 */
async function setOutputResult(result) {
  core.setOutput('result', result)

  const outputFile = core.getInput('_output-file')

  if (outputFile) {
    await writeFile(outputFile, result)
    core.info(`Result written to ${outputFile}`)
  }
}

async function writeFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, data)
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
