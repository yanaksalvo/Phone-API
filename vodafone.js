const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 1943;

app.get('/vodefoneOperator', async (req, res) => {
    const startTime = Date.now();
    const tcNo = req.query.tc;

    if (!tcNo) {
        return res.status(400).json({ success: false, message: "TC kimlik numarası girilmedi." });
    }
    if (!/^\d{11}$/.test(tcNo)) {
        return res.status(400).json({ success: false, message: "Geçersiz TC kimlik numarası. TC kimlik numarası 11 haneli bir sayı olmalıdır." });
    }

    const url = `https://m.vodafone.com.tr/maltgtwaycbu/api?method=getSubscriptions&tcNo=${encodeURIComponent(tcNo)}`;

    try {
        const response = await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const apiResponse = response.data;

        if (apiResponse.result && apiResponse.result.result === 'SUCCESS') {
            if (Array.isArray(apiResponse.subscriberList)) {
                const subscribers = apiResponse.subscriberList.map(subscriber => ({
                    TelefonNo: subscriber.subscriberUniqueKey ? subscriber.subscriberUniqueKey.substring(0, 10) : null,
                    AbonelikDurum: subscriber.status || null,
                    AbonelikBaslangicTarih: subscriber.startDate || null,
                    AbonelikBitisTarih: subscriber.endDate || null,
                    HatBorcTutari: subscriber.currentDebtAmount?.string || "0",
                }));

                const elapsedTime = Date.now() - startTime; 
                return res.json({
                    success: true,
                    status: 'success',
                    response_time_ms: elapsedTime,
                    data: subscribers
                });
            } else {
                const elapsedTime = Date.now() - startTime; 
                return res.status(404).json({
                    success: false,
                    status: 'failure',
                    response_time_ms: elapsedTime,
                    message: "Abonelik bilgisi bulunamadı."
                });
            }
        } else {
            const elapsedTime = Date.now() - startTime; 
            return res.status(404).json({
                success: false,
                status: 'failure',
                response_time_ms: elapsedTime,
                message: "Abonelik bilgisi bulunamadı."
            });
        }

    } catch (error) {
        const elapsedTime = Date.now() - startTime; 
        return res.status(500).json({
            success: false,
            status: 'error',
            response_time_ms: elapsedTime,
            message: "Abonelik bilgisi alınırken bir hata oluştu.",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
