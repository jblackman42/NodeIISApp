import Test from "./Test.jsx";
import PHCLogin from "./PHCLogin.jsx";
import ArticleFinder from "./ArticleFinder.jsx";
import Article from "./Article.jsx";
import SeriesFinder from "./SeriesFinder.jsx";
import SeriesDetails from "./SeriesDetails.jsx";
import SermonPlayer from "./SermonPlayer.jsx";

export default [
  {
    name: "test",
    Component: Test
  },
  {
    name: "phc-user-login",
    Component: PHCLogin
  },
  {
    name: "phc-article-finder",
    Component: ArticleFinder,
  },
  {
    name: "phc-article",
    Component: Article,
  },
  {
    name: "phc-series-finder",
    Component: SeriesFinder
  },
  {
    name: "phc-series-details",
    Component: SeriesDetails
  },
  {
    name: "phc-sermon-player",
    Component: SermonPlayer
  },

]