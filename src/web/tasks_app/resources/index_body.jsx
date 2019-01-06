'use strict';

// import {postJson} from '/js/request_utils.js';
function postJson(path, json_payload) {
  return fetch(path, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(json_payload),
  })
  .catch((error) => {
    console.error(error);
  });
}

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

class UpdateDescriptionComponent extends UpdatableTextFormComponent {
  constructor(props) {
    super(props);
    this.task_id = props.task_id;
  }
  
  createJsonPayload() {
    return {
      "task_id": this.task_id,
      "description": this.string_payload,
    };
  }
}

class UpdateStateComponent extends UpdatableTextFormComponent {
  constructor(props) {
    super(props);
    this.task_id = props.task_id;
  }
  
  createJsonPayload() {
    var kStates = ["NEW", "DONE"];
    if (kStates.indexOf(this.string_payload) < 0) {
      throw "Values must be one of: " + kStates.join();
    }
    return {
      "task_id": this.task_id,
      "state": this.string_payload,
    };
  }
}

class DeletableTagComponent extends StaticTextFormComponent {
  constructor(props) {
    super(props);
    this.task_id = props.task_id;
    this.tag_id = props.tag_id;
    this.parent_postprocessing = props.parent_postprocessing;
  }
  
  createJsonPayload() {
    return {
      "task_id": this.task_id,
      "tags": [{"tag_id": this.tag_id}],
    }
  }
  
  handleSubmit(event) {
    return StaticTextFormComponent.prototype.handleSubmit.call(this, event)
      .then((response) => {
        this.parent_postprocessing();
        return response;
      });
  }
  
  renderButtonComponent() {
    return (
      <button onClick={(event) => this.handleSubmit(event)}>
        Delete
      </button>
    );
  }
}

class AddTagComponent extends SimpleTextFormComponent {
  constructor(props) {
    super(props);
    this.task_id = props.task_id;
    this.parent_postprocessing = props.parent_postprocessing;
  }
  
  handleSubmit(event) {
    return SimpleTextFormComponent.prototype.handleSubmit.call(this, event)
      .then((response) => response.json())
      .then((responseJson) => {
        this.parent_postprocessing(responseJson.tags[0]);
      })
      .catch((error) => {console.log(error)});
  }
  
  createJsonPayload() {
    return {
      "task_id": this.task_id,
      "tags": [{"description": this.string_payload}]
    };
  }
}

class TagListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "tags": props.tags,
    };
    this.task_id = props.task_id;
    
    this.getDeleteFromStateFn = this.getDeleteFromStateFn.bind(this);
    this.getAddToStateFn = this.getAddToStateFn.bind(this);
  }
  
  static defaultProps = {
    "tags": []
  }
  
  getDeleteFromStateFn(tag_id) {
    let base = this;
    return function() {
      base.setState({
        "tags": base.state.tags.filter(
          (tag) => tag.tag_id != tag_id),
      });
    };
  }

  getAddToStateFn() {
    let base = this;
    return function(new_tag) {
      base.setState({
        "tags": base.state.tags.concat([new_tag]),
      });
    };
  }
  
  render() {
    var tag_components = [];
    for (var i = 0; i < this.state.tags.length; i++) {
      var tag = this.state.tags[i];
      tag_components.push(
        <DeletableTagComponent
          key={tag.tag_id}
          task_id={this.task_id}
          tag_id={tag.tag_id}
          string_payload={tag.description}
          write_path='/api/task/update/tags/delete'
          parent_postprocessing={this.getDeleteFromStateFn(tag.tag_id)}
          />);
    }
    return (
      <div>
        <AddTagComponent
          task_id={this.task_id}
          write_path='/api/task/update/tags/add'
          parent_postprocessing={this.getAddToStateFn()}
          />
        {tag_components}
      </div>
    );
  }
}

class DeletableTaskComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "task": props.task,
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.parent_postprocessing = props.parent_postprocessing;
  }
  
  handleSubmit(event) {
    event.preventDefault();
    return postJson('/api/task/delete', {"task_id": this.state.task.task_id})
      .then((response) => {
        this.parent_postprocessing();
        return response;
      });
  }
  
  render() {
    var task = this.state.task;
    return (
      <div>
        <button onClick={(event) => this.handleSubmit(event)}>
          (X)
        </button>
        <UpdateDescriptionComponent
          task_id={task.task_id}
          string_payload={task.description}
          write_path='/api/task/update/description'
          />
        <UpdateStateComponent
          task_id={task.task_id}
          string_payload={task.state}
          write_path='/api/task/update/state'
          />
        <TagListComponent task_id={task.task_id}
          tags={task.tags} />
      </div>
    );
  }
}

class AddTaskComponent extends SimpleTextFormComponent {
  constructor(props) {
    super(props);
    this.parent_postprocessing = props.parent_postprocessing;
  }
  
  handleSubmit(event) {
    return SimpleTextFormComponent.prototype.handleSubmit.call(this, event)
      .then((response) => response.json())
      .then((responseJson) => {
        this.parent_postprocessing(responseJson);
      })
      .catch((error) => {console.log(error)});
  }
  
  renderButtonComponent() {
    return (
      <button onClick={(event) => this.handleSubmit(event)}>Add Task</button>
    );
  }
  
  createJsonPayload() {
    return {
      "description": this.string_payload,
      "state": "NEW",
    };
  }
}

class TaskListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "tasks": props.tasks,
    };
    
    this.getDeleteFromStateFn = this.getDeleteFromStateFn.bind(this);
    this.getAddToStateFn = this.getAddToStateFn.bind(this);
  }
  
  static defaultProps = {
    "tasks": [],
  };
  
  getDeleteFromStateFn(task_id) {
    let base = this;
    return function() {
      base.setState({
        "tasks": base.state.tasks.filter(
          (task) => task.task_id != task_id),
      });
    };
  }
  
  getAddToStateFn() {
    let base = this;
    return function(new_task) {
      base.setState({
        "tasks": base.state.tasks.concat([new_task]),
      });
    };
  }

  render() {
    var tasks_rows = this.state.tasks.map((task) => {
        return <DeletableTaskComponent
          key={task.task_id}
          task={task}
          parent_postprocessing={this.getDeleteFromStateFn(task.task_id)}
          />;
    });
    return (
      <div>
        {tasks_rows}
        <AddTaskComponent
          write_path='/api/task/update'
          parent_postprocessing={this.getAddToStateFn()}
          />
      </div>
    );
  }
}

class TasksComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loading: false,
      tasks_info: null,
    };
  }
  
  // Loads the tasks data from the server.
  readTasksData() {
    this.setState({ is_loading: true });
    return fetch('/api/task/read', {method: 'POST'})
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          is_loading: false,
          tasks_info: responseJson,
        });
      })
      .catch((error) => {
        this.setState({
          is_loading: false,
          tasks_info: null,
        });
        console.log(error);
      });
  }
  
  // Adds a task.
  addTask() {
    // TODO: read UI elements
    var json_payload = {
      "description": "test task",
      "state": "NEW",
      "tags": [{"description": "hello"},
               {"description": "hi"}],
    };
    return fetch('api/task/update', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(json_payload),
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  componentDidMount() {
    this.readTasksData();
  }
  
  render() {
    if (!this.state.is_loading && this.state.tasks_info === null) {
      return (<div>Failed to load tasks</div>);
    }
    
    var tasks_div;
    if (this.state.is_loading) {
      tasks_div = <div>"Loading tasks..."</div>;
    } else {
      var tasks = this.state.tasks_info.results;
      tasks_div = <TaskListComponent tasks={tasks} />;
    }
    return (
      <div>
        <h2>My Tasks</h2>
        {tasks_div}
        <button onClick={() => this.readTasksData()}>
          Refresh Tasks Info
        </button>
      </div>
    );
  }
}

const indexBody = document.querySelector('#index_body');
ReactDOM.render(<TasksComponent />, indexBody);
