// 1. Función para crear el diseño del comentario y agregarlo a la pantalla
function addCommentToScreen(text) {
  const commentsList = document.getElementById('comments-list');
  const newComment = document.createElement('div');
  newComment.className = 'comment-box';
  newComment.innerText = text;
  
  // prepend() asegura que el más nuevo quede arriba
  commentsList.prepend(newComment);
}

// 2. Cargar los comentarios guardados al abrir o refrescar la página
window.addEventListener('DOMContentLoaded', () => {
  // Obtiene los comentarios guardados o crea una lista vacía si no hay ninguno
  const savedComments = JSON.parse(localStorage.getItem('my_comments')) || [];
  
  // Muestra cada comentario guardado en la pantalla
  savedComments.forEach(commentText => {
    addCommentToScreen(commentText);
  });
});

// 3. Lógica del botón "Publicar"
document.getElementById('submit-btn').addEventListener('click', function(event) {
  event.preventDefault(); 
  
  const input = document.getElementById('comment-input');
  const commentText = input.value.trim();

  if (commentText !== "") {
    // Mostrarlo en la pantalla
    addCommentToScreen(commentText);

    // Obtener la lista actual, agregar el nuevo y volver a guardar
    const savedComments = JSON.parse(localStorage.getItem('my_comments')) || [];
    savedComments.push(commentText); 
    localStorage.setItem('my_comments', JSON.stringify(savedComments));

    // Limpiar la caja de texto
    input.value = "";
  }
});