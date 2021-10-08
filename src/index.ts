import {
  PORT,
} from './utils/constants';

import app from './app';

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
