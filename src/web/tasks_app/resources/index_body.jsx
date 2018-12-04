'use strict';

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    var button_text = this.state.liked ? "Unlike" : "Like";
    return (
      <div>
        <h2>My Tasks</h2>
        <button onClick={() => this.setState(
            { liked: !this.state.liked })}>
          {button_text}
        </button>
      </div>
    );
  }
}

const indexBody = document.querySelector('#index_body');
ReactDOM.render(<LikeButton />, indexBody);
