'use strict';

class NavBarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: null,
      is_loading: false,
      text_value: '',
      edit_mode: false,
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  // Loads the user data from the server.
  readUserData() {
    this.setState({ is_loading: true })
    return fetch('/api/profile/read', {method: 'POST'})
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          is_loading: false,
          user_info: responseJson,
          text_value: responseJson.name,
        }, function(){
        });
      })
      .catch((error) =>{
        this.setState({
          is_loading: false,
          user_info: null,
        });
        console.log(error);
      });
  }
  
  // Writes username data to the server.
  writeUserData(json_payload) {
    return fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json_payload),
    })
      .then((response) => {
        this.setState({
          edit_mode: false,
        });
      })
      .catch((error) =>{
        console.error(error);
      });
  }
  
  logoutUser() {
    this.setState({ is_loading: true })
    return fetch('/api/profile/logout', {method: 'POST'})
      .then((response) => {
        this.setState({
          is_loading: false,
          user_info: null,
        });
      })
      .catch((error) =>{
        console.error(error);
      });
  }
  
  // On keystroke for text box.
  handleChange(event) {
    this.setState({text_value: event.target.value});
  }
  
  // On submit for text box.
  handleSubmit(event) {
    this.writeUserData({name: this.state.text_value});
    event.preventDefault();
  }

  componentDidMount() {
    this.readUserData();
  }

  render() {
    if (!this.state.is_loading && this.state.user_info === null) {
      return (<div><a href="/login/google">Login</a></div>);
    }
    // Construct the title contents.
    var title_div;
    if (this.state.is_loading) {
      title_div = <div>"Loading..."</div>;
    } else {
      title_div = (
        <div>
          <form onSubmit={this.handleSubmit}>
            <fieldset disabled={!this.state.edit_mode}
              style={{display: "inline"}}><label>
              Hello <input type="text" value={this.state.text_value}
                      onChange={this.handleChange} />
            </label></fieldset>
            <button onClick={(event) => {
                if (this.state.edit_mode) {
                  this.handleSubmit(event);
                } else {
                  this.setState({edit_mode: true});
                  event.preventDefault();
                }
              }}
              style={{borderStyle: this.state.edit_mode ? "inset" : "outset"}}>
              Edit
            </button>
          </form>
          <div>{this.state.user_info.email}</div>
        </div>);
    }
    return (
      <div>
        {title_div}
        <button onClick={() => this.readUserData()}>
          Refresh User Info
        </button>
        <button onClick={() => this.logoutUser()}>
          Logout
        </button>
      </div>
    );
  }
}

const navbar = document.querySelector('#navbar');
ReactDOM.render(<NavBarComponent />, navbar);