const files = [];

// {
//     file: {
//       name: 'Screenshot from 2022-02-10 19-30-40.png',
//       mtime: 2022-02-10T14:00:41.152Z,
//       encoding: 'octet',
//       clientDetail: {},
//       meta: {},
//       id: 0,
//       size: 981223,
//       bytesLoaded: 0,
//       success: true,
//       user: { id: 'nJ7TA73YX3JPnesGAAAF', username: 'KK', room: 'Room 1' },
//       fileId: '1721dbaae858768f5e75dbe7debbab99'
//     }
//   }

const addFile = (file) => {
  if (!file) return { error: "File not found" };
  files.push(file);
};

module.exports = { addFile };
