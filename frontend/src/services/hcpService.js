import api from "./api";

export const getAllHCPs = async () => {
    const { data } = await api.get("/hcps");
    return data;
};