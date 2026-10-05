export default {
  title: 'Stepper',
  lead: '<code>VStepper</code> shows the steps of a process and where the reader stands. Render the content of each step yourself from the same <code>v-model</code>.',
  examples: {
    states: {
      title: 'States',
      text: 'Steps before the current one are completed and those after it upcoming. <code>completed</code> overrides this for a step, <code>error</code> wins over every state and <code>disabled</code> takes a step out of reach.',
    },
    nonLinear: {
      title: 'Non-linear',
      text: 'By default only the steps already reached are buttons. <code>nonLinear</code> makes every step one; set <code>completed</code> on the steps that are done.',
    },
    vertical: {
      title: 'Vertical',
      text: '<code>orientation="vertical"</code> lays the steps down a column, for a sidebar. Below 36rem, a horizontal stepper keeps only the title of the current step on screen.',
    },
  },
  api: {
    VStepper: {
      props: {
        steps:
          'Steps in order: <code>value</code>, <code>title</code>, and optional <code>description</code>, <code>error</code>, <code>completed</code> and <code>disabled</code>.',
        orientation: 'Layout direction.',
        nonLinear:
          'Makes every step that is not disabled a button. By default, only the steps already reached are.',
        label: 'Accessible name of the list of steps. Defaults to the library dictionary.',
        vModel: 'Value of the current step. The first step is current when it is unset.',
      },
      slots: {
        indicator:
          'Content of the circle of a step. Receives <code>step</code>, <code>index</code> and <code>state</code>.',
      },
    },
  },
}
