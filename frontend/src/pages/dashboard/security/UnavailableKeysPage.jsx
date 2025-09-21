import { useOutletContext } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import KeyCard from "../../../components/keys/KeyCard";

const UnavailableKeysPage = () => {
  const { unavailableKeys, handleCollectKey } = useOutletContext();
  return (
    <div className="flex-1 p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Unavailable Keys</h2>
        <div className="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-600/30">
          {unavailableKeys.length} Unavailable
        </div>
      </div>

      {unavailableKeys.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">All keys are available!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unavailableKeys.map((key) => (
            <KeyCard
              key={key.id}
              keyData={key}
              variant="unavailable"
              onCollectKey={handleCollectKey}
              userRole="security"
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default UnavailableKeysPage;
