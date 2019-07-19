import React from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
  Dimensions,
  Animated,
  ImageBackground,
  Image
} from 'react-native';
import { GestureHandler, Svg } from 'expo';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
import { snap } from '@popmotion/popcorn';
const { PanGestureHandler, State } = GestureHandler;
const { Path, G, Text, TSpan } = Svg;
//const { width } = Dimensions.get('screen');

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const numberOfSegments = 9;
const wheelSize = width * 1.3;
const wheelCircle = wheelSize*1.05
const fontSize = 26;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const wheelX = -180
const wheelY = 40

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
      value: Math.round(Math.random() * 10 + 1) * 10, //[200, 2200]
      centroid: instance.centroid(arc)
    };
  });
};

export default class App extends React.Component {
  _wheelPaths = makeWheel();
  _angle = new Animated.Value(0);
  angle = 0;

  state = {
    enabled: true,
    finished: false,
    winner: null
  };

  componentDidMount() {
    this._angle.addListener(event => {
      if (this.state.enabled) {
        this.setState({
          enabled: false,
          finished: false
        });
      }

      this.angle = event.value;
    });
  }

  _getWinnerIndex = () => {
    const deg = Math.abs(Math.round(this.angle % oneTurn));
    return Math.floor(deg / angleBySegment);
  };

  _onPan = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { velocityY } = nativeEvent;

      Animated.decay(this._angle, {
        velocity: velocityY / 1000,
        deceleration: 0.999,
        useNativeDriver: true
      }).start(() => {
        this._angle.setValue(this.angle % oneTurn);
        const snapTo = snap(oneTurn / numberOfSegments);
        Animated.timing(this._angle, {
          toValue: snapTo(this.angle),
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          const winnerIndex = this._getWinnerIndex();
          this.setState({
            enabled: true,
            finished: true,
            winner: this._wheelPaths[winnerIndex].value
          });
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
          <ImageBackground source={require("./app/img/background.png")} style={styles.container}>
            <View style={styles.wheelContainer}>
              {this._renderSvgWheel()}
            </View>
            {this.state.finished && this.state.enabled}
            {this._renderTopHeader()}
            {this._renderBotHeader()}
          </ImageBackground>
        </View>
      </PanGestureHandler>
    );
  }

  _renderTopHeader = () => {
    return (
      <View style={styles.TopHeader}/>
    )
  }
  _renderBotHeader = () => {
    return (
      <View style={styles.BotHeader}>
          <Image
            source={require("./app/img/left_arrow.png")}
            style={styles.LeftArrow}
            />
      </View>
    )
  }
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
          <Svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
          >
            <G y={width/2} x={width/2}>
              {this._wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();

                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path} fill={arc.color} />
                    <G
                      rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                      origin={`${x}, ${y}`}
                    >
                      <Text
                        x={x}
                        y={y - 70}
                        fill="white"
                        textAnchor="middle"
                        fontSize={fontSize}
                      >
                        {Array.from({ length: number.length }).map((_, j) => {
                          return (
                            <TSpan
                              x={x}
                              dy={fontSize}
                              key={`arc-${i}-slice-${j}`}
                            >
                              {number.charAt(j)}
                            </TSpan>
                          );
                        })}
                      </Text>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  TopHeader: {
    width: width,
    height: 24,
    backgroundColor: '#035473',
    position:'absolute',
    top: 0
  },
  BotHeader: {
    width: width,
    height: 50,
    backgroundColor: '#066d95',
    position:'absolute',
    top: 24
  },
  LeftArrow: {
    transform: [{translateX:8}, {translateY:11}],
  },
  wheelContainer: {
    transform: [{translateX:wheelX}, {translateY:wheelY}]
  },
  wheelCircle: {
    width: wheelCircle,
    height: wheelCircle,
    borderRadius: wheelCircle/2,
    backgroundColor: '#004863'
    //transform: [{translateX:wheelX}, {translateY:wheelY}]
  },
  winnerText: {
    fontSize: 32,
    fontFamily: 'Menlo',
    position: 'absolute',
    bottom: 10
  }
});