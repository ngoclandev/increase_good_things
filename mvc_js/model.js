export const state = {
  users: [
    {
      userId: 1,
      username: "diephalam",
      takeNote: [
        {
          title: "Meditation",
          days: 0,
        },
      ],
    },
  ],
};

function addNote(userId, { title, days }) {
  const user = state.users.filter((user) => user.userId === userId);

  user.takeNote.push({ title, days });
}
