import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import HCPCard from "./HCPCard";
import { getAllHCPs } from "../../services/hcpService";
import { setHCP } from "../interaction/interactionSlice";

export default function HCPPage() {

  const [hcps, setHcps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {

    async function load() {
      try {
        setLoading(true);

        const data = await getAllHCPs();

        setHcps(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load HCPs.");
      } finally {
        setLoading(false);
      }
    }

    load();

  }, []);

  const filtered = useMemo(() => {

    const q = search.toLowerCase();

    return hcps.filter((hcp) =>
      hcp.name.toLowerCase().includes(q) ||
      hcp.specialty.toLowerCase().includes(q) ||
      hcp.hospital.toLowerCase().includes(q)
    );

  }, [hcps, search]);

  const handleLogInteraction = (hcp) => {

    dispatch(setHCP(hcp));

    navigate("/log-interaction");

  };

  return (
    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-white">
            HCP Directory
          </h1>

          <p className="text-slate-400 mt-2">
            Browse and manage healthcare professionals.
          </p>

        </div>

      </div>

      {/* Search */}

      <div className="relative max-w-md mb-6">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          className="crm-input pl-11"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <p className="text-slate-400 mb-6">
        Showing {filtered.length} HCPs
      </p>

      {/* Loading */}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {Array.from({ length: 6 }).map((_, i) => (

            <div
              key={i}
              className="glass-card rounded-2xl h-64 animate-pulse"
            />

          ))}

        </div>
      )}

      {/* Error */}

      {!loading && error && (

        <div className="glass-card rounded-xl p-6 text-center text-red-400">

          {error}

        </div>

      )}

      {/* Empty */}

      {!loading && !error && filtered.length === 0 && (

        <div className="glass-card rounded-xl p-8 text-center text-slate-400">

          No doctors found.

        </div>

      )}

      {/* Cards */}

      {!loading && filtered.length > 0 && (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((hcp) => (

            <HCPCard
              key={hcp.id}
              hcp={hcp}
              onLogInteraction={handleLogInteraction}
            />

          ))}

        </div>

      )}

    </div>
  );
}