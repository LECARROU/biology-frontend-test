// Put your custom JS code here
console.log("CUSTOM JS LOADED");
function loadMarkdown(file) {
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error();
      return response.text();
    })
    .then(text => {
      document.getElementById("markdown-preview").innerHTML = marked.parse(text);
    })
    .catch(() => {
      document.getElementById("markdown-preview").innerHTML =
        "<p class='text-danger'>Le fichier markdown est introuvable.</p>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("subject-select");
  const preview = document.getElementById("markdown-preview");

  // Charger la liste des sujets
  fetch("/docs/subjects.csv")
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.split("\n").slice(1);

      lines.forEach(line => {
        line = line.replace(/\r$/, "");
        if (!line.trim()) return;

        const match = line.match(/^(\d+),"(.+)"$/);
        if (!match) return;

        const number = match[1];
        const subject = match[2];
        const mdPath = `/markdowns/sujet_${number}.md`;

        const option = document.createElement("option");
        option.value = mdPath;
        option.textContent = subject;

        select.appendChild(option);
      });
    });

  // Charger le markdown quand on change de sélection
  select.addEventListener("change", () => {
    const file = select.value;

    if (!file) {
      preview.innerHTML = "<p>Sélectionnez un sujet pour afficher son contenu.</p>";
      return;
    }

    fetch(file)
      .then(response => {
        if (!response.ok) throw new Error();
        return response.text();
      })
      .then(text => {
        preview.innerHTML = marked.parse(text);
      })
      .catch(() => {
        preview.innerHTML = "<p class='text-danger'>Le fichier markdown est introuvable.</p>";
      });
  });

  const downloadBtn = document.getElementById("download-btn");

  select.addEventListener("change", () => {
    const file = select.value;

    if (!file) {
      downloadBtn.disabled = true;
      return;
    }

    downloadBtn.disabled = false;
  });

  // Télécharger le fichier Markdown
  downloadBtn.addEventListener("click", () => {
    const file = select.value;
    if (!file) return;

    const fileName = file.split("/").pop();

    fetch(file)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  });

});


