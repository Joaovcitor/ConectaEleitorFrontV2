import { MapPin, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { citizenService } from "../api/services";
import type { CitizenResponseDTO } from "../api/types";
import { VotersMap } from "../components/VotersMap";

export function VotersMapPage() {
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setCitizens(await citizenService.list({ pageSize: 1000 }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Geografia</span>
          <h1>Mapa de Eleitores</h1>
          <p>Visualize a distribuição aproximada dos eleitores cadastrados a partir dos CEPs informados.</p>
        </div>
        <button className="primary-button" type="button" onClick={load}>
          <RefreshCw size={18} /> Atualizar
        </button>
      </div>

      <div className="alert info">
        <MapPin size={18} />
        <span>Este MVP usa geocodificação pública no navegador e cache local. A posição é aproximada por CEP.</span>
      </div>

      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      {loading ? <div className="panel"><div className="loading-card"><strong>Carregando eleitores...</strong><span>Buscando cadastros para montar o mapa.</span></div></div> : <VotersMap citizens={citizens} />}
    </section>
  );
}
