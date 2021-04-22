const trans = require('./index')

const case1 = `
const Home = () => {
  return <View>123</View>
}
export default Home;
`
const case1Result = `import { TrackWrapper } from "taro-track";

const Home = () => {
  return <TrackWrapper><View>123</View></TrackWrapper>;
};

export default Home;`

const case2 = `export default () => <div></div>`
const case2Result = `import { TrackWrapper } from "taro-track";
export default (() => <TrackWrapper><div></div></TrackWrapper>);`

const case3 = `export default () => {
  return <div></div>
}`
const case3Result = `import { TrackWrapper } from "taro-track";
export default (() => {
  return <TrackWrapper><div></div></TrackWrapper>;
});`
const case4 = `
const Home = () => {
  return <View>123</View>
}
export default connect(undefined, mapDispatchToProps)(Home);
`

const case4Result = `import { TrackWrapper } from "taro-track";

const Home = () => {
  return <TrackWrapper><View>123</View></TrackWrapper>;
};

export default connect(undefined, mapDispatchToProps)(Home);`

test('test transCode', () => {
  expect(trans(case1)).toBe(case1Result)
  expect(trans(case2)).toBe(case2Result)
  expect(trans(case3)).toBe(case3Result)
  expect(trans(case4)).toBe(case4Result)
})
