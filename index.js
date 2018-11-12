





const flatten = ( children )=>{
    let res = []
    children.forEach(e=>Array.isArray(e)?res=res.concat(flatten(e)):res.push(e));
    return res;
}

const isComponent = ( type )=>{
  //not support right now
  return false;
}

const propsMapper = {
  "className": "class"
}

let lastNode;

class Component{
  constructor(){
    this.updateState = false;
    this.queue = [];
  }
  setState(state, cb){
    this.queue.push([state, cb])
    if( this.updateState == false ){
      this.updateState = true;
      setTimeout(()=>{
        DiffDom.shouldRender();
        this.updateState = false;
        if( !this.state )this.state = {}
        const cbList = []
        this.queue.forEach(([state, cb])=>{
          //const state = obj[0], cb = obj[1]
          if( typeof state == "function"){
            this.state = {...this.state, ...state(this.state)}
          }else{
            this.state = {...this.state, ...state};
          }
          if( cb ) cbList.push(cb);
          ////forEach
        })
        cbList.forEach(cb=>cb(this.state));
      },1)
    }

  }
}

class _DiffDom{

  setProps(el, props){
    Object.keys(props).forEach(prop=>this.setProp(el, this.propMapAttr(prop), props[prop]))
  }

  setProp(el, name, value){

    if( name.startsWith("on")){
      el.addEventListener(name.substr(2).toLowerCase(), value);
    }else{
      el.setAttribute(name, value)
    }
  }

  removeProp(el, name){
    if( name.startsWith("on") ){
      el.removeEventListener(name.substr(2).toLowerCase());
    }else{
      el.removeAttribute(name)
    }
  }

  diffProps(newNode, oldNode){
    const {newProps} = newNode
    const {oldProps} = oldNode
    const patches = []
    const props = Object.assign({}, newProps, oldProps)
    for( let name in props){
      const newVal = newProps[name], oldVal = oldProps[name]
      if( !newVal )
        patches.push({type:"REMOVE_PROP", name})
      else if( !oldVal || oldVal !== newVal )
        patches.push({type:"SET_PROP", name, value:props[name]})
    }
    return patches
  }

  patchProps(el, patches){
    patches.forEach((patch, idx)=>{
      const {type, name, value} = patch
      if( type == "SET_PROP")
        this.setProp(el, name, value)
      else if(type == "REMOVE_PROP")
        this.removeProp(el, name)
    })
  }

  diffChildren( newNode, oldNode){
    const patches = []
    const patchesLength = Math.max(newNode.children.length, oldNode.children.length)
    for( let i = 0; i < patchesLength; i++){
      patches[i] = this.diff(newNode.children[i], oldNode.children[i]);
    }
    return patches
  }

  patch(parent, patches, index = 0){
    if( !patches ) return;
    if( !parent ) return;
    //console.log("update:",patches)
    const el = parent.childNodes[index];
    switch(patches.type){
      case "CREATE":{
        const {newNode} = patches;
        return parent.appendChild(this.createDomNode(newNode))
      }
      case "REMOVE": {
        return parent.removeChild(el)
      }
      case "REPLACE":{
        const {newNode} = patches;
        const newEl = this.createDomNode(newNode)
        //console.log("replace ", newEl, el);
        return parent.replaceChild(newEl, el);
      }
      case "UPDATE":{

        const {children, props} = patches;
        this.patchProps(parent, props)
        if( children ){
          children.forEach((item, idx)=>
            this.patch(el, item, idx))
        }
      }
    }
  }

  isChange(node1, node2){
    return (typeof node1 !== typeof node2 )||
            ((typeof node1 === 'string' || typeof node1 === "number") && node1 !== node2 )||
            ( typeof node1 === "object" && node1.type !== node2.type)||
            ( typeof node1 === "function" && node1.name !== node2.name)
  }

  diff(newNode, oldNode){
    if( !oldNode)
      return {type:"CREATE", newNode}
    else if( !newNode )
      return {type:"REMOVE"}
    else if( this.isChange(newNode, oldNode)){
      //console.log("replace ", newNode, oldNode)
      return {type:"REPLACE", newNode }
    }
    if( newNode.type ){
      if( typeof oldNode.type === "string")
        return {type:"UPDATE", children:this.diffChildren(newNode, oldNode), props:this.diffProps(newNode, oldNode)}
      else{
        if( oldNode.inst ){
          const inst = oldNode.inst;
          const oldChildren = inst.render()
          inst.props = newNode.props
          const newChildren = inst.render()
          return {type:"UPDATE", children:this.diffChildren(newChildren, oldChildren), props:[]}
        }else{
          return {type:"UPDATE", children:this.diffChildren(newNode(newNode.props), oldNode(oldNode.props)), props:{}}
        }
      }
    }
    //console.log("no return :", newNode, oldNode)
    //return newNode
  }

  propMapAttr(prop){
    prop = propsMapper[prop] || prop
    if( prop.startsWith("on"))
      return prop.toLowerCase()
    return prop
  }

  createDomNode( node ){
      const typeOfNode = typeof node;
      if( typeOfNode !== "object" && typeOfNode != "function" ){
          return document.createTextNode(node);
      }
      const type = node.type
      if( typeof type === "string"){
        const el = document.createElement(node.type);
        this.setProps(el, node.props)
        node.children.forEach(child=>el.appendChild(this.createDomNode(child)))
        return el
      }else{
        if( isComponent(type) ){
          const inst = new type(props)

        }else{
          const inst = type(props)
          this.createDomNode(inst)
        }
      }
  }


  createElement(type, props, ...children){
      props = props||{}
      return {type, props, children:flatten(children)}
  }
  clean(node){
    for(var n = 0; n < node.childNodes.length; n ++){
      var child = node.childNodes[n];
      if( child.nodeType === 8 ||
          (child.nodeType === 3 && !/\S/.test(child.nodeValue) ) ){
        node.removeChild(child);
        n --;
      }
      else if(child.nodeType === 1){
        this.clean(child);
      }
    }
  }
  renderDom( component, element ){
    this.dom = element || this.dom;
    this.component = component || this.component;
    const newNode = this.component.render();
    const patches = this.diff(newNode, lastNode);
    this.clean(this.dom)
    this.patch(this.dom, patches);
    lastNode = newNode;
  }

  shouldRender(){
    if( !this.renderFlag ){
      this.renderFlag = true;
      setTimeout(()=>{
        this.renderFlag = false;
        this.renderDom()
      },1);
    }
  }
}

const DiffDom = new _DiffDom();
//export default DiffDom
