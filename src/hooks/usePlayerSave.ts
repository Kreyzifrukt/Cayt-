import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Save } from "../types/player";
import { loadSave, persistSave } from "../services/storage/playerStorage";

export function usePlayerSave(): [Save, Dispatch<SetStateAction<Save>>] {
  const [save, setSave] = useState<Save>(loadSave);

  useEffect(() => {
    persistSave(save);
  }, [save]);

  return [save, setSave];
}
