import { testDefintions } from "./nets";
import Dictionary from 'oxford-dictionary-api';
import { NeuralNetwork } from "brain.js";

const dict_id = '1d7b1b12';
const dict_key = 'fa76d145e59d2bd208f916322c1d6496';
const D: any = Dictionary;
const dict = new D(dict_id, dict_key);

function getDefinition(word: string) {
  return new Promise((resolve, reject) => {
    dict.find(word, (err: any, data: any) => resolve(err ? err : data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]));
  });
}

export default {
  "definition": async (utterance: string) => {
    const input = defs(utterance);
    const output = testDefintions(input);
    // console.log(input);
    const result = findWinner(output);
    const word = utterance.split(' ')[parseInt(result.winner)];
    console.log("Word of interest: ", word, "    Confidence: ", result.confidence + "%");
    const def = await getDefinition(word);
    console.log(`\n${word}: ${def}`);
  },
  "weather": async (utterance: string) => {
    const net = new NeuralNetwork();
    
  }
}

export function defs(utterance: string) {
  const plainLength = utterance.length;
  const spacelessLength = utterance.replace(/\s/g, '').length;
  const linearString = utterance.split('').reduce((accumulator, value) => accumulator + value.charCodeAt(0).toString(), '');
  const sectionLength = Math.ceil(linearString.length / 4);
  const linear = linearString.match(new RegExp(`.{1,${sectionLength}}`, 'g'))!;
  const scrambled: string[] = ['', '', '', ''];
  // linear.forEach(section => section.split('').forEach((character, index) => scrambled[index % 4] += character));
  // console.log(scrambled);
  // console.log("Length with spaces: ", plainLength);
  // console.log("Length without spaces: ", spacelessLength);
  // console.log("Sections: ", sectionLength);
  // console.log("Linear split: ", linear);
  const linearDivisor = Math.pow(10, sectionLength) / 1.3;
  // console.log("Divisor: ", linearDivisor);
  return {
    plainLength: sigmoid(plainLength / 1000),
    spacelessLength: sigmoid(spacelessLength / 1000),
    linear0: sigmoid(parseInt(linear[0]) / linearDivisor),
    linear1: sigmoid(parseInt(linear[1]) / linearDivisor),
    linear2: sigmoid(parseInt(linear[2]) / linearDivisor),
    linear3: sigmoid(parseInt(linear[3]) / linearDivisor),
    // scrambled0: sigmoid(parseInt(scrambled[0]) / linearDivisor),
    // scrambled1: sigmoid(parseInt(scrambled[1]) / linearDivisor),
    // scrambled2: sigmoid(parseInt(scrambled[2]) / linearDivisor),
    // scrambled3: sigmoid(parseInt(scrambled[3]) / linearDivisor),
    totalWords: utterance.split(' ').length,
    // sectionLength: sigmoid(sectionLength)
  }
}

export function normalizeString(s: string) {
  const normalized = s.replace(/[.,#!$%\^&\*;'\+{}=\-_`~()]/g,"").toLocaleLowerCase();
  return normalized;
}

export function sigmoid(t: number) {
  return 2 * (1/(1+Math.exp(-t))) - 1;
}

export function findWinner(output: any) {
  const tags = Object.keys(output);
  let winner = '';
  let max = 0;
  for (let tag of tags) {
    if (output[tag] > max) {
      winner = tag;
      max = output[tag];
    }
  }
  if (max <= .5) winner = 'none';
  const confidence = Math.round(max * 1000) / 10;
  return {winner, max, confidence};
}
