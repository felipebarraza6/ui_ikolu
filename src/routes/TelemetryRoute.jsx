import { lazy, Suspense, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../App";
import { RouteFallback } from "./RouteFallback";

const MyWell = lazy(() => import("../components/mywell/MyWell"));
const Sma = lazy(() => import("../components/Sma"));
const TableStandarVerySmallResponsive = lazy(
  () => import("../components/mywell/TableStandarVerySmallResponsive")
);

export default function TelemetryRoute() {
  const { state } = useContext(AppContext);
  const profile = state?.selected_profile;

  if (!profile?.id) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="font-bold">Elige un punto en el centro de control.</p>
        <Link to="/" className="mt-2 inline-block text-sm font-bold text-navy underline dark:text-limebrand">
          Volver al tablero
        </Link>
      </div>
    );
  }

  let page = <Sma />;
  if (profile.profile_ikolu?.entry_by_form) {
    page = <TableStandarVerySmallResponsive data={profile} />;
  } else if (profile.dga?.type_dga === "SUBTERRANEO" || !profile.dga?.type_dga) {
    page = <MyWell />;
  }

  return <Suspense fallback={<RouteFallback />}>{page}</Suspense>;
}
