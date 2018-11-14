# diff-dom
  diff-dom is an vanilla js with diff algorithm to improve render efficiency. It is similar as `React` and the project will implement more features which React has. Here is an template to build an App easily. [diff-dom-template](https://github.com/chejianchao/diff-dom-template/edit/master/README.md)

# Demo
  **Basic Example [diff-dom-template](https://github.com/chejianchao/diff-dom-template/edit/master/README.md)**  
  ![picture](https://media.giphy.com/media/mRnFokMDKnQocunGkD/giphy.gif)  
  
  [Mine Sweeper](https://github.com/chejianchao/mine-sweeper)  
  ![picture](https://media.giphy.com/media/39onL30N9A5TJVhIMh/giphy.gif)
  
# How to use
  Detail in [diff-dom-template](https://github.com/chejianchao/diff-dom-template/edit/master/README.md)

# Api
  `DiffDom.shouldRender()` will notify to render the dom.
  Your component which extends from `Component` can use setState to notify to render the dom, you can go to ./src/component1.js to see the example.

# Notice
  1. Component should be used after created and called `component.render()`, you can not use it as `<Component />`. 
  2. Component doesn't support Life Cycle method right now.
  
# Next Step
  1. Support Self-define Component JSX syntax, like `<Component />` and Function Component.
  2. Life Cycle of Class Component. such as `ComponentDidMount`, `ComponentWillUnmount` and etc.
  3. Integrate WebPack to make development easily, such as save file and rebuild automatically.
