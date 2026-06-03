// utils/pipelineStorage.js

const STORAGE_KEY = 'vs-saved-pipelines';

export const getSavedPipelines = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const savePipeline = (name, data) => {
  const pipelines = getSavedPipelines();
  const existing = pipelines.findIndex((p) => p.name === name);
  const newPipeline = {
    name,
    data,
    savedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    pipelines[existing] = newPipeline;
  } else {
    pipelines.push(newPipeline);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines));
  return newPipeline;
};

export const deletePipeline = (name) => {
  const pipelines = getSavedPipelines().filter((p) => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines));
};

export const exportToJSON = (data, filename = 'pipeline.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importFromJSON = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject('No file selected');
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          resolve(data);
        } catch (err) {
          reject('Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
