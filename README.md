# eslint-plugin-private-props

Assume all properties/methods that begin with an underscore and the `handle` prefix (specific case for React components) are private and generate errors for unused or undeclared properties.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-private-props`:

```
$ npm install eslint-plugin-private-props --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-private-props` globally.

## Usage

Add `private-props` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "private-props"
  ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "private-props/all": 2
  }
}
```

## Supported Rules

### `private-props/all`
Enable support for ES6 classes, React.createClass, and prototypical inheritance

#### Options
`privateMatchers` Change the default set of matchers for private properties

Default:

```json
{
  "rules": {
    "private-props/all": [2, {
      "privateMatchers": [
        "^_", 
        "^handle[A-Z]""
      ]
    }]
  }
}
