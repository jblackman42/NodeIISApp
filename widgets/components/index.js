import Test from "./Test.jsx";
import PHCLogin from "./PHCLogin.jsx";
import ArticleFinder from "./ArticleFinder.jsx";
import Article from "./Article.jsx";
import SeriesFinder from "./SeriesFinder.jsx";
import SeriesDetails from "./SeriesDetails.jsx";
import SermonPlayer from "./SermonPlayer.jsx";
import FeaturedEvents from "./FeaturedEvents.jsx";
import PrayerLog from "./PrayerLog.jsx";
import WpadChampionDays from "./WpadChampionDays.jsx";

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
  {
    name: "phc-featured-events",
    Component: FeaturedEvents
  },
  {
    name: "wpad-prayer-log",
    Component: PrayerLog
  },
  {
    name: "phc-wpad-champion-days",
    Component: WpadChampionDays
  },

]