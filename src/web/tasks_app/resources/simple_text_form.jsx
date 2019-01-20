'use strict';

// import {postJson} from 'request_utils.js';

class StaticTextFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.display_text = props.string_payload;

    // Posts the data to the server.
    this.write_path = props.write_path;
    this.createJsonPayload = this.createJsonPayload.bind(this)
    this.renderTextComponent = this.renderTextComponent.bind(this);
    this.renderButtonComponent = this.renderButtonComponent.bind(this);
  }
  
  // Creates JSON from string_payload. Subclasses should override this method
  // to determine how to set the request json.
  createJsonPayload() {
    return {};
  }
  
  // On submit for text box.
  handleSubmit(event) {
    event.preventDefault();
    return postJson(this.write_path, this.createJsonPayload());
  }
  
  renderTextComponent() {
    return (
      <label>[{this.display_text}]</label>
    );
  }
  
  renderButtonComponent() {
    return (
      <button onClick={(event) => this.handleSubmit(event)}>Do</button>
    );
  }
  
  render() {
    var text_component = this.renderTextComponent();
    var button_component = this.renderButtonComponent();
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {text_component}
          {button_component}
        </form>
      </div>
    );
  }
}

class SimpleTextFormComponent extends StaticTextFormComponent {
  constructor(props) {
    super(props);
    this.state = {
      "string_payload": "",
    };
    this.handleChange = this.handleChange.bind(this);
  }
  
  get string_payload() {
    return this.state.string_payload;
  }

  handleSubmit(event) {
    return StaticTextFormComponent.prototype.handleSubmit.call(this, event)
      .then((response) => {
        this.setState({"string_payload": ""})
        return response;
      });
  }
  
  handleChange(event) {
    this.setState({"string_payload": event.target.value});
  }
  
  renderTextComponent() {
    return (
      <input type="text" value={this.state.string_payload}
        onChange={this.handleChange} />
    );
  }
  
  renderButtonComponent() {
    return (
      <button onClick={(event) => this.handleSubmit(event)}>+</button>
    );
  }
}
  

class UpdatableTextFormComponent extends StaticTextFormComponent {
  constructor(props) {
    super(props);
    this.state = {
      edit_mode: false,
      string_payload: props.string_payload,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  
  get string_payload() {
    return this.state.string_payload;
  }
  
  handleSubmit(event) {
    return StaticTextFormComponent.prototype.handleSubmit.call(this, event)
      .then((response) => {
        this.setState({
          edit_mode: false,
        });
      });
  }
  
  // On keystroke for text box.
  handleChange(event) {
    this.setState({string_payload: event.target.value});
  }
  
  renderTextComponent() {
    return (
      <fieldset disabled={!this.state.edit_mode} style={{display: "inline"}}>
        <input type="text" value={this.state.string_payload}
          onChange={this.handleChange} /></fieldset>);
  }
  
  renderButtonComponent() {
    return (
      <button onClick={(event) => {
          if (this.state.edit_mode) {
            this.handleSubmit(event);
          } else {
            this.setState({edit_mode: true});
            event.preventDefault();
          }
        }} style={{borderStyle: this.state.edit_mode ? "inset" : "outset"}}>
        Edit
      </button>);
  }
}
