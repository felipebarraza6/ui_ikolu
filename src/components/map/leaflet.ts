import L from "leaflet";

const host = window as Window & { L?: typeof L };
host.L = L;

export default L;
