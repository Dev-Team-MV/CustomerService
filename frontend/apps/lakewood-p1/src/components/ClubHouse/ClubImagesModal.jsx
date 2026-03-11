import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  Map,
  Layers,
  MeetingRoom,
  Check,
  Deck,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import uploadService from "../../services/uploadService";
import { useTranslation } from "react-i18next";
import ImagePreview from "../../components/ImgPreview";
import ModalWrapper from "../../constants/ModalWrapper";
import PrimaryButton from "../../constants/PrimaryButton";

const ClubImagesModal = ({ open, onClose, onImagesUploaded }) => {
  const { t } = useTranslation(["clubHouse", "common"]);
  const [tab, setTab] = useState(0);
  const [selectedInteriorSection, setSelectedInteriorSection] =
    useState("Reception");
  const [interiorKeys, setInteriorKeys] = useState([]);
  const [existingImages, setExistingImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {},
    deck: [], // NEW
  });
  const [selectedFiles, setSelectedFiles] = useState({
    exterior: [],
    blueprints: [],
    interior: {},
    deck: [], // NEW
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadInteriorKeys();
    }
  }, [open]);

  useEffect(() => {
    if (open && interiorKeys.length > 0) {
      loadExistingImages();
      setSelectedInteriorSection(interiorKeys[0]);
    }
  }, [open, interiorKeys]);

  const loadInteriorKeys = async () => {
    try {
      const response = await uploadService.getClubhouseInteriorKeys();
      const keys = response.interiorKeys || [];
      setInteriorKeys(keys);
      setExistingImages((prev) => ({
        ...prev,
        interior: keys.reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
      }));
      setSelectedFiles((prev) => ({
        ...prev,
        interior: keys.reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
      }));
      setError(null);
    } catch (err) {
      setError("Failed to load interior sections");
    }
  };
  const extractPathFromUrl = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      let p = decodeURIComponent(u.pathname || "");
      p = p.replace(/^\/+/, ""); // remove leading slash
      const idx = p.indexOf("clubhouse/");
      if (idx !== -1) return p.slice(idx);
      // fallback: return decoded pathname
      return p;
    } catch (e) {
      const idx = typeof url === "string" ? url.indexOf("clubhouse/") : -1;
      if (idx !== -1) return url.slice(idx);
      const qIdx = typeof url === "string" ? url.indexOf("?") : -1;
      return qIdx === -1 ? url : url.slice(0, qIdx);
    }
  };

  const stableKeyForImage = (img, idx) => {
    if (!img) return idx;
    if (img._id) return img._id;
    if (img.storagePath) return img.storagePath;
    if (typeof img.url === "string") return img.url.split("?")[0];
    return idx;
  };

  const sortImagesByKey = (arr = []) => {
    return (arr || []).slice().sort((a, b) => {
      // Usa name, storagePath, o createdAt si existe
      const ka = a?.storagePath || a?.name || a?.createdAt || "";
      const kb = b?.storagePath || b?.name || b?.createdAt || "";
      return ka.localeCompare(kb);
    });
  };

  // Normaliza los arrays de imágenes a objetos con url/isPublic/_id/raw
  const normalizeOrganized = (organized) => {
    const normItem = (it) => {
      if (!it) return null;
      if (typeof it === "string") {
        const storagePath = extractPathFromUrl(it) || it;
        return { url: it, isPublic: true, _id: null, raw: it, storagePath };
      }
      const url =
        it.url ||
        it.publicUrl ||
        it.path ||
        (typeof it === "object" &&
          Object.values(it).find(
            (v) => typeof v === "string" && v.startsWith("http"),
          )) ||
        "";
      const storagePath = it.name || it.path || extractPathFromUrl(url) || null;
      return {
        url,
        isPublic: typeof it.isPublic === "boolean" ? it.isPublic : true,
        _id: it._id || it.id || null,
        raw: it,
        storagePath,
      };
    };

    const out = { exterior: [], blueprints: [], interior: {}, deck: [] };
    out.exterior = (organized.exterior || []).map(normItem).filter(Boolean);
    out.blueprints = (organized.blueprints || []).map(normItem).filter(Boolean);
    out.deck = (organized.deck || []).map(normItem).filter(Boolean);
    const intObj = organized.interior || {};
    Object.keys(intObj).forEach((k) => {
      out.interior[k] = (intObj[k] || []).map(normItem).filter(Boolean);
    });

    // sort each section deterministically to keep stable order across updates
    out.exterior = sortImagesByKey(out.exterior);
    out.blueprints = sortImagesByKey(out.blueprints);
    out.deck = sortImagesByKey(out.deck);
    Object.keys(out.interior).forEach((k) => {
      out.interior[k] = sortImagesByKey(out.interior[k]);
    });
    return out;
  };

  // Debug: cada vez que existingImages cambie, imprime su resumen
  useEffect(() => {
    console.log("🔔 existingImages updated:", {
      exterior: existingImages.exterior.length,
      blueprints: existingImages.blueprints.length,
      deck: existingImages.deck.length,
      interiorKeys: Object.keys(existingImages.interior || {}).reduce(
        (acc, k) => ({
          ...acc,
          [k]: (existingImages.interior[k] || []).length,
        }),
        {},
      ),
    });
    // show a sample item for deck if exists
    if ((existingImages.deck || []).length > 0) {
      console.log("🔔 existingImages.deck[0]:", existingImages.deck[0]);
    }
  }, [existingImages]);

  const loadExistingImages = async () => {
    setLoading(true);
    try {
      console.log(
        "🔎 loadExistingImages: requesting /upload/files?folder=clubhouse",
      );
      const response = await uploadService.getFilesByFolder("clubhouse", true);
      console.log("🔎 loadExistingImages: response:", response);

      // Si el backend devuelve clubHouse dentro de la respuesta del POST
      const maybeClubHouse =
        response?.clubHouse || response?.data?.clubHouse || null;
      if (maybeClubHouse) {
        const organizedFromClub = mapClubHouseToOrganized(maybeClubHouse);
        const normalized = normalizeOrganized(organizedFromClub);
        console.log(
          "🔁 loadExistingImages: organizedFromClub (normalized):",
          normalized,
        );
        setExistingImages(normalized);
        return;
      }

      if (response.files) {
        const organized = {
          exterior: [],
          blueprints: [],
          interior: {},
          deck: [],
        };
        interiorKeys.forEach((key) => {
          organized.interior[key] = [];
        });

        response.files.forEach((file) => {
          const { _id, section, interiorKey, url, publicUrl, isPublic } = file;
          const imageUrl = url || publicUrl;
          const imageObj = {
            _id,
            url: imageUrl,
            isPublic: isPublic ?? true,
            raw: file,
          };

          if (section === "exterior") organized.exterior.push(imageObj);
          else if (section === "blueprints")
            organized.blueprints.push(imageObj);
          else if (section === "interior" && interiorKey) {
            if (!organized.interior[interiorKey])
              organized.interior[interiorKey] = [];
            organized.interior[interiorKey].push(imageObj);
          } else if (section === "deck") organized.deck.push(imageObj);
          // No agregar a exterior cuando section es null/undefined (evita que imágenes de interior aparezcan en exterior)
        });

        // --- NUEVO: intentar traer archivos específicos de "deck" si no llegaron como section
        try {
          let deckResponse = null;
          try {
            deckResponse = await uploadService.getDeckFiles(true);
          } catch (err) {
            // fallback a otro endpoint si existe
            try {
              deckResponse = await uploadService.getClubhouseDeckFiles(true);
            } catch (err2) {
              deckResponse = null;
            }
          }
          if (deckResponse?.files && deckResponse.files.length) {
            deckResponse.files.forEach((f) => {
              const imageUrl = f.url || f.publicUrl || f.path || f;
              // evitar duplicados por URL
              if (!organized.deck.some((i) => (i.url || i) === imageUrl)) {
                organized.deck.push({
                  _id: f._id,
                  url: imageUrl,
                  isPublic: f.isPublic ?? true,
                  raw: f,
                });
              }
            });
          }
        } catch (err) {
          console.warn("Could not load deck-specific files:", err);
        }

        const normalized = normalizeOrganized(organized);
        console.log(
          "🔁 loadExistingImages: organized from files (normalized):",
          normalized,
        );
        setExistingImages(normalized);
      } else {
        console.warn("🔎 loadExistingImages: no response.files found");
      }
    } catch (err) {
      console.error("❌ loadExistingImages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapClubHouseToOrganized = (clubHouse) => {
    const organized = {
      exterior: [],
      blueprints: [],
      interior: {},
      deck: [], // NEW
    };
    interiorKeys.forEach((key) => {
      organized.interior[key] = [];
    });

    if (!clubHouse) return organized;

    (clubHouse.exterior || []).forEach((item) => {
      const url = item.url || item.publicUrl || "";
      organized.exterior.push({
        _id: item._id,
        url,
        isPublic: item.isPublic ?? true,
        raw: item,
        storagePath: item.name || item.path || extractPathFromUrl(url) || null,
      });
    });

    (clubHouse.blueprints || []).forEach((item) => {
      const url = item.url || item.publicUrl || "";
      organized.blueprints.push({
        _id: item._id,
        url,
        isPublic: item.isPublic ?? true,
        raw: item,
        storagePath: item.name || item.path || extractPathFromUrl(url) || null,
      });
    });

    (clubHouse.deck || []).forEach((item) => {
      const url = item.url || item.publicUrl || "";
      organized.deck.push({
        _id: item._id,
        url,
        isPublic: item.isPublic ?? true,
        raw: item,
        storagePath: item.name || item.path || extractPathFromUrl(url) || null,
      });
    });

    const interiorObj = clubHouse.interior || {};
    Object.keys(interiorObj).forEach((key) => {
      organized.interior[key] = (interiorObj[key] || []).map((item) => {
        const url = item.url || item.publicUrl || "";
        return {
          _id: item._id,
          url,
          isPublic: item.isPublic ?? true,
          raw: item,
          storagePath:
            item.name || item.path || extractPathFromUrl(url) || null,
        };
      });
    });

    return organized;
  };

  const handleToggleImageVisibility = async (
    section,
    index,
    checked,
    interiorKey = null,
  ) => {
    try {
      // Envía el cambio al backend
      const response = await uploadService.updateClubhouseImageVisibility({
        section,
        index,
        isPublic: checked,
        interiorKey,
      });

      // Solo actualiza la imagen modificada en el estado
      setExistingImages((prev) => {
        if (section === "interior" && interiorKey) {
          return {
            ...prev,
            interior: {
              ...prev.interior,
              [interiorKey]: prev.interior[interiorKey].map((img, i) =>
                i === index ? { ...img, isPublic: checked } : img,
              ),
            },
          };
        } else {
          return {
            ...prev,
            [section]: prev[section].map((img, i) =>
              i === index ? { ...img, isPublic: checked } : img,
            ),
          };
        }
      });
    } catch (err) {
      // Manejo de error
      console.error("Error updating visibility:", err);
    }
  };

  const getNextFileName = (section, interiorKey, ext) => {
    // Busca cuántas imágenes ya existen en esa sección
    let count = 0;
    if (section === "interior" && interiorKey) {
      count = (existingImages.interior[interiorKey] || []).length;
    } else {
      count = (existingImages[section] || []).length;
    }
    // Siguiente número
    const nextNum = count + 1;
    // Nombre base
    const base =
      section === "interior" && interiorKey
        ? `${section}_${interiorKey.replace(/\s+/g, "_")}_${nextNum}.${ext}`
        : `${section}_${nextNum}.${ext}`;
    return base;
  };

  const handleToggleIsPublicSelected =
    (section, idx, interiorKey = null) =>
    (e) => {
      const checked = e?.target?.checked ?? false;
      setSelectedFiles((prev) => {
        const update = (arr) =>
          arr.map((f, i) =>
            f && typeof f === "object"
              ? i === idx
                ? { ...f, isPublic: checked }
                : f
              : f,
          );
        if (section === "interior" && interiorKey) {
          return {
            ...prev,
            interior: {
              ...prev.interior,
              [interiorKey]: update(prev.interior[interiorKey]),
            },
          };
        } else {
          return {
            ...prev,
            [section]: update(prev[section]),
          };
        }
      });
    };

  const handleFileSelect = (event, section) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles((prev) => {
      if (section === "interior") {
        return {
          ...prev,
          interior: {
            ...prev.interior,
            [selectedInteriorSection]: [
              ...(Array.isArray(prev.interior[selectedInteriorSection])
                ? prev.interior[selectedInteriorSection]
                : []),
              ...files.map((file) => ({ file, isPublic: false })),
            ],
          },
        };
      } else {
        return {
          ...prev,
          [section]: [
            ...(Array.isArray(prev[section]) ? prev[section] : []),
            ...files.map((file) => ({ file, isPublic: false })),
          ],
        };
      }
    });
  };
  // ...existing code...

  const handleRemoveSelectedFile = (section, index, interiorKey = null) => {
    setSelectedFiles((prev) => {
      if (section === "interior" && interiorKey) {
        const newInterior = { ...prev.interior };
        newInterior[interiorKey] = newInterior[interiorKey].filter(
          (_, i) => i !== index,
        );
        return { ...prev, interior: newInterior };
      } else {
        return {
          ...prev,
          [section]: prev[section].filter((_, i) => i !== index),
        };
      }
    });
  };

  const handleConfirmUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const uploadPromises = [];
      // Prepara los arrays para subir: solo archivos y visibilidad
      const prepareFiles = (arr, section, interiorKey = null) =>
        arr.map((item, idx) => {
          const ext = item.file.name.split(".").pop();
          const customName = getNextFileName(section, interiorKey, ext);
          return {
            file: item.file,
            isPublic: item.isPublic,
            fileName: customName,
          };
        });
      console.log("📤 handleConfirmUpload: preparing uploads", {
        exterior: selectedFiles.exterior.length,
        blueprints: selectedFiles.blueprints.length,
        deck: selectedFiles.deck?.length || 0,
        interior: Object.fromEntries(
          Object.entries(selectedFiles.interior).map(([k, v]) => [k, v.length]),
        ),
      });

      // ...dentro de handleConfirmUpload...

      // Upload exterior
      if (selectedFiles.exterior.length > 0) {
        uploadPromises.push(
          uploadService.uploadClubhouseImages(
            prepareFiles(selectedFiles.exterior, "exterior"), // <-- pasa la sección
            "exterior",
          ),
        );
      }

      // Upload blueprints
      if (selectedFiles.blueprints.length > 0) {
        uploadPromises.push(
          uploadService.uploadClubhouseImages(
            prepareFiles(selectedFiles.blueprints, "blueprints"), // <-- pasa la sección
            "blueprints",
          ),
        );
      }

      // Upload deck
      if (selectedFiles.deck.length > 0) {
        const deckPayload = prepareFiles(selectedFiles.deck, "deck"); // <-- pasa la sección
        console.log("📤 handleConfirmUpload: uploading deck payload preview", {
          section: "deck",
          count: deckPayload.length,
          sample: deckPayload
            .slice(0, 5)
            .map((p) => ({
              name: p.fileName,
              size: p.file?.size,
              isPublic: p.isPublic,
            })),
        });
        uploadPromises.push(
          uploadService.uploadClubhouseImages(deckPayload, "deck"),
        );
      }

      // Upload interior sections (solo una vez por sección)
      for (const [key, files] of Object.entries(selectedFiles.interior)) {
        if (files.length > 0) {
          uploadPromises.push(
            uploadService.uploadClubhouseImages(
              prepareFiles(files, "interior", key),
              "interior",
              key,
            ),
          );
        }
      }
      if (uploadPromises.length === 0) {
        setError("No files selected to upload");
        setUploading(false);
        return;
      }
      console.log("📤 handleConfirmUpload: starting Promise.all for uploads");
      const results = await Promise.all(uploadPromises);
      console.log("📤 handleConfirmUpload: upload results raw:", results);

      // intentar extraer clubHouse desde cualquier estructura anidada en `results`
      const extractClubHouse = (obj) => {
        if (!obj) return null;
        if (obj.clubHouse) return obj.clubHouse;
        if (obj.data && obj.data.clubHouse) return obj.data.clubHouse;
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = extractClubHouse(item);
            if (found) return found;
          }
        }
        if (typeof obj === "object") {
          for (const val of Object.values(obj)) {
            const found = extractClubHouse(val);
            if (found) return found;
          }
        }
        return null;
      };

      let clubHouseFromResponse = null;
      for (const res of results) {
        clubHouseFromResponse = extractClubHouse(res);
        if (clubHouseFromResponse) break;
      }

      if (clubHouseFromResponse) {
        console.log(
          "✅ handleConfirmUpload: clubHouse found in upload response — updating existingImages from clubHouse",
          clubHouseFromResponse,
        );
        const organized = mapClubHouseToOrganized(clubHouseFromResponse);
        const normalized = normalizeOrganized(organized);
        console.log(
          "✅ handleConfirmUpload: organized (from response) normalized:",
          normalized,
        );
        setExistingImages(normalized);
      } else {
        console.log(
          "ℹ️ handleConfirmUpload: no clubHouse found in responses, reloading via GET",
        );
        await loadExistingImages();
      }

      // clear selected files
      setSelectedFiles({
        exterior: [],
        blueprints: [],
        interior: interiorKeys.reduce(
          (acc, key) => ({ ...acc, [key]: [] }),
          {},
        ),
        deck: [],
      });

      if (onImagesUploaded) {
        onImagesUploaded();
      }
      setError(null);
    } catch (err) {
      console.error("Error uploading images:", err);
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };
  // ...existing code...

  // const handleDeleteExistingImage = async (section, imageUrl, interiorKey = null) => {
  //   // TODO: Implementar endpoint de eliminación
  // };

  const getCurrentExistingImages = () => {
    if (tab === 0) return existingImages.exterior;
    if (tab === 1) return existingImages.blueprints;
    if (tab === 2)
      return existingImages.interior[selectedInteriorSection] || [];
    if (tab === 3) return existingImages.deck || [];

    return [];
  };

  const getCurrentSelectedFiles = () => {
    if (tab === 0) return selectedFiles.exterior;
    if (tab === 1) return selectedFiles.blueprints;
    if (tab === 2) return selectedFiles.interior[selectedInteriorSection] || [];
    if (tab === 3) return selectedFiles.deck || [];
    return [];
  };

  const getCurrentSection = () => {
    if (tab === 0) return "exterior";
    if (tab === 1) return "blueprints";
    if (tab === 2) return "interior";
    if (tab === 3) return "deck";
    return "interior";
  };

  const getTotalSelectedFiles = () => {
    let total =
      selectedFiles.exterior.length +
      selectedFiles.blueprints.length +
      (selectedFiles.deck?.length || 0);
    Object.values(selectedFiles.interior).forEach((files) => {
      total += files.length;
    });
    return total;
  };

  const handleDeleteExistingImage = async (
    section,
    image,
    interiorKey = null,
  ) => {
    const prevState = JSON.parse(JSON.stringify(existingImages));

    // Determina el nombre de archivo para eliminar
    const determineFileName = (img) => {
      if (!img) return null;
      if (img.storagePath) return img.storagePath;
      if (img.raw?.name) return img.raw.name;
      if (img.raw?.path) return img.raw.path;
      if (img.url) {
        const url = img.url.split("?")[0];
        const idx = url.indexOf("clubhouse/");
        if (idx !== -1) return url.slice(idx);
        return url.split("/").pop();
      }
      return null;
    };

    const fileName = determineFileName(image);

    console.log("🗑️ handleDeleteExistingImage: deleting", fileName);

    setExistingImages((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (section === "interior" && interiorKey) {
        next.interior[interiorKey] = (next.interior[interiorKey] || []).filter(
          (it) => (it._id || it.url) !== (image._id || image.url),
        );
      } else {
        next[section] = (next[section] || []).filter(
          (it) => (it._id || it.url) !== (image._id || image.url),
        );
      }
      return next;
    });

    try {
      setError(null);
      if (!fileName) throw new Error("Could not determine file path to delete");

      // Llama al endpoint correcto con payload
      await uploadService.deleteClubhouseImages({
        filenames: [fileName],
        deleteFromStorage: true,
      });

      await loadExistingImages();
    } catch (err) {
      setError(err?.message || "Failed to delete image");
      setExistingImages(prevState);
    }
  };

return (
  <ModalWrapper
    open={open}
    onClose={onClose}
    icon={CloudUpload}
    title={t('clubHouse:title')}
    subtitle={
      getTotalSelectedFiles() > 0
        ? t('clubHouse:readyToUpload', { count: getTotalSelectedFiles() })
        : undefined
    }
    actions={
      <PrimaryButton
        onClick={handleConfirmUpload}
        disabled={getTotalSelectedFiles() === 0 || uploading}
        loading={uploading}
        startIcon={!uploading ? <Check /> : undefined}
      >
        {uploading
          ? t('clubHouse:uploading')
          : t('clubHouse:upload', { count: getTotalSelectedFiles() })}
      </PrimaryButton>
    }
    maxWidth="md"
    fullWidth
  >
    {error && (
      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    )}

    <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
      <Tab icon={<Map />} label={t('clubHouse:tabs.exterior')} iconPosition="start" />
      <Tab icon={<Layers />} label={t('clubHouse:tabs.plans')} iconPosition="start" />
      <Tab icon={<MeetingRoom />} label={t('clubHouse:tabs.interior')} iconPosition="start" />
      <Tab icon={<Deck />} label={t('clubHouse:tabs.deck')} iconPosition="start" />
    </Tabs>

    {tab === 2 && (
      <Box mb={3}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          {t('clubHouse:selectSection')}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {interiorKeys.map(key => {
            const count = (existingImages.interior[key]?.length || 0) +
              (selectedFiles.interior[key]?.length || 0);
            return (
              <Chip
                key={key}
                label={key}
                onClick={() => setSelectedInteriorSection(key)}
                color={selectedInteriorSection === key ? "primary" : "default"}
              />
            );
          })}
        </Box>
      </Box>
    )}

    <Box mb={3}>
      <PrimaryButton component="label" startIcon={<CloudUpload />} disabled={uploading || loading}>
        {t('clubHouse:selectImages')}
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e, getCurrentSection())}
        />
      </PrimaryButton>
      <Typography variant="caption" display="block" mt={1}>
        {tab === 2
          ? t('clubHouse:selectingFor', { section: selectedInteriorSection })
          : t('clubHouse:selectingFor', { section: getCurrentSection() })}
      </Typography>
    </Box>

    {loading ? (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress color="secondary" />
      </Box>
    ) : (
      <>
        {getCurrentSelectedFiles().length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="secondary">
              <CloudUpload fontSize="small" />
              {t('clubHouse:readyToUpload', { count: getCurrentSelectedFiles().length })}
            </Typography>
            <Grid container spacing={2}>
              {getCurrentSelectedFiles().map((file, idx) => (
                <Grid item xs={6} sm={4} key={idx}>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <ImagePreview
                      src={
                        file.file instanceof File
                          ? URL.createObjectURL(file.file)
                          : typeof file.file === 'string'
                            ? file.file
                            : ''
                      }
                      alt={`Preview ${idx + 1}`}
                      isPublic={!!file.isPublic}
                      onTogglePublic={checked =>
                        handleToggleIsPublicSelected(
                          getCurrentSection(),
                          idx,
                          tab === 2 ? selectedInteriorSection : null
                        )({ target: { checked } })
                      }
                      onDelete={() =>
                        handleRemoveSelectedFile(
                          getCurrentSection(),
                          idx,
                          tab === 2 ? selectedInteriorSection : null
                        )
                      }
                      showSwitch={true}
                      switchPosition="top-right"
                      label="NEW"
                      imgSx={{ height: 160 }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {getCurrentExistingImages().length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              {t('clubHouse:uploadedImages', { count: getCurrentExistingImages().length })}
            </Typography>
            <Grid container spacing={2}>
              <AnimatePresence>
                {getCurrentExistingImages().map((img, idx) => (
                  <Grid item xs={6} sm={4} key={stableKeyForImage(img, idx)}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                      <ImagePreview
                        src={typeof img === 'string' ? img : img.url}
                        alt={`Image ${idx + 1}`}
                        isPublic={!!(img.isPublic ?? true)}
                        onTogglePublic={checked =>
                          handleToggleImageVisibility(
                            getCurrentSection(),
                            idx,
                            checked,
                            tab === 2 ? selectedInteriorSection : null
                          )
                        }
                        onDelete={() =>
                          handleDeleteExistingImage(
                            getCurrentSection(),
                            img,
                            tab === 2 ? selectedInteriorSection : null
                          )
                        }
                        showSwitch={true}
                        switchPosition="top-right"
                        imgSx={{ height: 160 }}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Box>
        )}

        {getCurrentExistingImages().length === 0 && getCurrentSelectedFiles().length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2">
              {t('clubHouse:noImagesYet')}
            </Typography>
          </Paper>
        )}
      </>
    )}
  </ModalWrapper>
)
};

export default ClubImagesModal;
