import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { APP_WEATHERAPI } from "@env";
import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = APP_WEATHERAPI;
const icons = {
  "Clouds": "cloudy", 
  "Clear": "day-sunny", 
  "Rain": "rain",
  "Atmosphere": "cloudy-gusts",
  "Snow": "snow",
  "Drizzle": "rain",
  "Thunderstorm": "lightning",
}

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("00:00:00")) {
          return weather;
        }
      })
    );
  };
  useEffect(() => {
    getWeather();
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {ok ? (
        <>
          <View style={styles.city}>
            <Text style={styles.cityName}>{city}</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            // indicatorStyle='white'
            contentContainerStyle={styles.weather}
          >
            {days.length === 0 ? (
              <View style={styles.day}>
                <ActivityIndicator
                  color="white"
                  style={{ marginTop: 10 }}
                  size="large"
                />
              </View>
            ) : (
              days.map((day, index) => (
                <View key={index} style={styles.day}>
                  <View style={styles.row}> 
                  <Text style={styles.temp}>
                    {parseFloat(day.main.temp).toFixed(1)}
                  </Text>
                  <Fontisto name={icons[day.weather[0].main]} size={48} color="white" />
                  </View>
                  <Text style={styles.description}>{day.weather[0].main}</Text>
                  <Text style={styles.tinyText}>
                    {day.weather[0].description}
                  </Text>
                  <Text style={styles.tinyText}>{day.dt_txt.slice(0, 10)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <>
        <View style={styles.city}>
            <Text style={styles.cityName}>Not Allowed</Text>
            <Text style={{...styles.description, marginTop: 30, fontSize: "20"}}>Tap Settings and enable Override GPS location under Advanced settings.</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 58,
    fontWeight: "500",
    color: "white",
  },
  weather: {
    // backgroundColor: "blue"
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  row: {
    marginBottom: 10,
    flexDirection: "row", 
    alignItems: "center", 
    width: "90%", 
    justifyContent: "space-between"
  },
  temp: {
    fontWeight: "600",
    fontSize: 100,
    color: "white"
  },
  description: {
    marginTop: -30,
    width: "85%",
    color: "white",
    fontSize: 40,
  },
  tinyText: {
    width: "83%",
    color: "white",
    fontSize: 20,
  },
});
