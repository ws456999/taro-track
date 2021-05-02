import { Component } from "react";
import { View, Text, Button } from "@tarojs/components";
import { AtButton } from "taro-ui";

import "taro-ui/dist/style/components/button.scss"; // 按需引入
import "./index.less";

const Home = () => {
  return (
    <View className="index">
      <Text>1. bury test</Text>
      <Button type="primary" id={"only-bury"}>
        bury demo
      </Button>

      <Text>2. bury with dataset</Text>
      <Button type="primary" id={"bury-with-dataset"} data-vvv={"vvv-dataset"}>
        bury with dataset
      </Button>
    </View>
  );
};

export default Home;
