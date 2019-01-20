'use strict';

// import {UpdatableTextFormComponent,
//         StaticTextFormComponent,
//         SimpleTextFormComponent} from 'simple_text_form.jsx';

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
