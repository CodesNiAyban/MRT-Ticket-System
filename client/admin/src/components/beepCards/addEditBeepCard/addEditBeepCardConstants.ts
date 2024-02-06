import * as FareApi from "../../../network/fareAPI";

export const DEFAULT_UUIC_PREFIX = "637805";
export const DEFAULT_LOAD_MIN = 10;
export const DEFAULT_LOAD_MAX = 5000;

export const generateDefaultNumber = () => {
  const generatedUUIC =
    DEFAULT_UUIC_PREFIX +
    Math.floor(Math.random() * Math.pow(10, 9))
      .toString()
      .padStart(9, "0");
  return generatedUUIC;
};

export const getDefaultLoadPrice = async () => {
  try {
    const fares = await FareApi.fetchFare();
    const defaultLoadFare = fares.find(
      (fare) => fare.fareType === "DEFAULT LOAD"
    );
    const minimumFare = fares.find(
      (fare) => fare.fareType === "MINIMUM FARE"
    );
    return defaultLoadFare!.price + minimumFare!.price;
  } catch (error) {
    console.error(error);
    return DEFAULT_LOAD_MIN;
  }
};
