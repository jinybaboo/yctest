import axios from 'axios';

export const getKospi200 = async () => {
    const url = `http://1.234.5.5:8090/get/kospi200`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error('getKospi200 오류', error);
    }
};