import React from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
  Image,
  Alert,
  Button
} from 'react-native';
import { GestureHandler, Svg } from 'expo';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
import { snap } from '@popmotion/popcorn';
const { PanGestureHandler, State } = GestureHandler;
const { Path, G, Text } = Svg;
import Confetti from 'react-native-confetti';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const numberOfSegments = 10
const wheelSize = width * 1.30;//1.67
const wheelCircle1 = wheelSize*1.05
const wheelCircle2 = wheelCircle1*1.08
const wheel = width * 1.5
const fontSize = 10;//10
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const productList = ["Zonk","Hadiah 1a","Zonk","Hadiah 1b", "Hadiah 1c","Zonk","Hadiah 2a", "Hadiah 2b","Zonk","Hadiah 3"]
let rngNum = -1
let result = "-1"
let rngSpin = 1
let slice = 0


let arrayRange = (start, end) => {
  len = end-start
  var arr = new Array(len);
  for (var i = 0; i < len; i++, start++) 
  {
    arr[i] = start;
  }
    return arr;
}
const prizes = {
  "Zonk":arrayRange(0,19).concat(arrayRange(343,360)).concat(arrayRange(55,91)).concat(arrayRange(127,163)).concat(arrayRange(235,271)),
  "Hadiah 3":arrayRange(19,55),
  "Hadiah 1a":arrayRange(91,127),
  "Hadiah 1b":arrayRange(163,199),
  "Hadiah 1c":arrayRange(199,235),
  "Hadiah 2a":arrayRange(271,307),
  "Hadiah 2b":arrayRange(307,343),
}
/*
const makeWheel = () => {
  const data = Array.from({ length: numberOfSegments }).fill(1);
  const arcs = d3Shape.pie()(data);

  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0)
      .outerRadius(width / 2)
      .innerRadius(10);

    return {
      path: instance(arc),
      color: (index % 2 == 0) ? "#a1abdd" : "#c5c8e9",//colors[index]
      value: productList[index],//Math.round(Math.random() * 10 + 1) * 10, //[200, 2200]
      centroid: instance.centroid(arc)
    };
  });
};
*/
const getAPI = () => {
  //GET request 
  //https://j5aj5lnxxf.execute-api.ap-southeast-1.amazonaws.com/prod/num
  fetch('https://j5aj5lnxxf.execute-api.ap-southeast-1.amazonaws.com/prod/num', {
      method: 'GET'
      //Request Type 
  })
  .then((response) => response.json())
  //If response is in json then in success
  .then((responseJson) => {
      //Success 
      //alert(JSON.stringify(responseJson));
      //rngNum = responseJson.rngWheel
      rngSpin = responseJson.rngSpin
      //console.log(rngNum)
  })
  //If response is not in json then in error
  .catch((error) => {
      //Error 
      alert(JSON.stringify(error));
      console.error(error);
  });
}

export default class App extends React.Component {
  //_wheelPaths = makeWheel();
  _angle = new Animated.Value(0);
  angle = 0;

  state = {
    enabled: true,
    random: true
  };

  componentDidMount() {
    this._angle.addListener(event => {
      if (this.state.enabled) {
        this.setState({
          enabled: false,
          random: true
        });
      }
      this.angle = event.value;
    });
  }

  findSlice = (num) => {
    for (const [key, value] of Object.entries(prizes)) {
      if (value.includes(num)){
        result = key
      }
    }
  }
  winningSlice = () => {
    this._wheelPaths.map((arc, i) => {
      if (arc.value == result) {
        arc.color = "#fc7200"
      } else {
        arc.color = "#000000"
      }
    })
    this.setState({
      enabled: false,
      random: false
    })
  }

  resetWheel = () => {
    var _this = this
    setTimeout(function() {
      _this.setState({
        enabled: true,
        random: true
      })
    }, 3500)
  }

  

  getSlice = () => {
    this._wheelPaths.map((arc, i) => {
      arc.color = "#000000"
    })
    this.setState({
      enabled: false,
      random: false
    })
  }

  reset = () => {
    this.setState({
      enabled: true,
      random: true
    })
    rngNum = -1
    result = "-1"
    this._wheelPaths.map((arc, i) => {
      arc.color = (i % 2 == 0) ? "#a1abdd" : "#c5c8e9"
    })
    this._confettiView.stopConfetti()
  }

  messageBox = () => {
    if (result == 'Zonk'){
      alert("Zonk! Anda Kurang Beruntung!")
    } else {
      this._confettiView.startConfetti()
      alert("Anda dapat "+ result+"!")
    }
  }

  _onPan = ({ nativeEvent }) => {
    if (this.state.random) {
      getAPI()
      this.state.random = false
    }
    if (nativeEvent.state === State.END) {
      const { velocityY } = nativeEvent;

      Animated.decay(this._angle, {
        velocity: (velocityY<500) ? -((velocityY/1500)+rngSpin) : -(velocityY/1500),
        deceleration: 0.999,
        useNativeDriver: true
      }).start(() => {
        this._angle.setValue(this.angle % oneTurn);
        console.log(this._angle)
        console.log(this.angle)
        const snapTo = snap(oneTurn / numberOfSegments);
        Animated.timing(this._angle, {
          toValue: snapTo(this.angle),
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          num = parseInt(this.angle % oneTurn) * -1
          slice = (num == -0) ? 0 : num
          console.log("SLICE")
          console.log(slice)
          this.findSlice(slice)
          this.messageBox()
          this.setState({
            enabled: false
          });
          this.resetWheel()
        });
        // do something here;
      });
    }
  };

  render() {
    return (
      <PanGestureHandler
        onHandlerStateChange={this._onPan}
        enabled={this.state.enabled}
      >
        <View style={styles.container}>
          <Image
            source={require("./app/img/bg2.png")}
            style={styles.background}
          />
          <View style={styles.wheelView}>
            {this._renderSvgWheel()}
          </View>
          <Image
            source={require("./app/img/pointer2.png")}
            style={styles.pointer}
          />
          <Confetti size={2} bsize={2} untilStopped={false} confettiCount={200} ref={(node) => this._confettiView = node}/>
          {this._renderWinner()}
        </View>
      </PanGestureHandler>
    );
  }


  _renderWinner = () => {
    return (
      <RNText style={styles.winnerText}>Prize: {result}</RNText>
    );
  };
  _renderSvgWheel = () => {
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: this._angle.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`]
                })
              }
            ]
          }}
        >
        <Image
          source={require("./app/img/wheel2.png")}
          style={styles.wheelPic}
        />
        </Animated.View>
      </View>
    );
  };
}


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: width,
    height: height
  },
  pointer: {
    position:"absolute",
    left:"72%",
    top:"54%"
  },
  wheelCircle1: {
    width: wheelCircle1,
    height: wheelCircle1,
    borderRadius: wheelCircle1/2,
    backgroundColor: '#0089ff',
    position:"absolute",
  },
  wheelCircle2: {
    width: wheelCircle2,
    height: wheelCircle2,
    borderRadius: wheelCircle2/2,
    backgroundColor: '#0089ff',
    alignItems: 'center',
    justifyContent: 'center',
    position:"absolute",
    top: "17%"
  },
  wheelView: {
    width: wheel,
    height: wheel,
    borderRadius: wheel/2,
    position:"absolute",
    top:"15%",
    left: "35%"
  },
  wheelPic: {
    width: wheel,
    height: wheel,
    position: "absolute",
    transform: [{ rotate: `-${angleOffset-2}deg` }]
  },
  reset: {
    position: 'absolute',
    top: height/4,
    left:50+width/2,
    backgroundColor:"#fff",
    borderWidth: 0.8,
    borderColor:"#000",
    borderRadius:4
  },
  winnerText: {
    fontSize: 20,
    fontFamily: 'Menlo',
    position: 'absolute',
    bottom: 10
  }
});
