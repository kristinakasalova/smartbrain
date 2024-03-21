import React, { Component } from "react";
import Navigation from "./components/navigation/Navigation";
import Logo from "./components/logo/Logo.js";
import ImageLinkForm from "./components/imagelinkform/ImageLinkForm.js";
// import Signin from "./components/Signin/signin.js";
// import Register from "./components/Register/register.js";
import FaceRecognition from "./components/facerecognition/FaceRecognition.js";
import Rank from "./components/rank/Rank.js";
import "./App.css";
import ParticlesBg from "particles-bg";

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    fetch('https://smartbrain-be-2qg8.onrender.com')
      .then((response) => response.json())
      .then(console.log);
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    const returnClarifaiRequestOptions = (imageUrl) => {
      const IMAGE_URL = imageUrl;

      const raw = JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                url: IMAGE_URL,
              },
            },
          },
        ],
      });

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Key e63a899d541a4506b9675c665f4da124",
        },
        body: raw,
      };

      fetch(
        "https://api.clarifai.com/v2/inputs/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result) {
            fetch("https://smartbrain-be-2qg8.onrender.com/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: this.state.user.id,
              }),
            })
              .then((response) => response.json())
              .then((count) => {
                this.setState(
                  Object.assign(this.state.user, { entries: count })
                );
              });
          }
          this.displayFaceBox(this.calculateFaceLocation(result));
        });
    };

  };

onRouteChange = (route) => {
  if (route === "signout") {
    this.setState(initialState);
  } else if (route === "home") {
    this.setState({ isSignedIn: true });
  }

  this.setState({ route: route });
};

render() {
  const { isSignedIn, imageUrl, /*route,*/ box } = this.state;
  return (
    <div className="App">
      <ParticlesBg className="Particles" type="circle" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
       {/* {route === "home" ? ( */
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
          <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      /*{ ) : route === "signin" ? (
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      ) : (
      <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      )*/
    }
    </div> 
    //}
  )
  ;
}
}

export default App;
