const SEPA = require("sepa");
const fs = require("fs");
const os = require('os');
const path = require('path');

console.log("Validate MP iban--->" + SEPA.validateIBAN("IT32N0200824404000040072358"))

document.getElementById("start").addEventListener('click', () => {
	const file = document.getElementById("fileInput").files[0];
	const desktopDir = path.join(os.homedir(), 'Desktop');

	if (!file) {
		return;
	}

	const myDate = new Date();
	const isoDateTime = myDate.toISOString()


	const reader = new FileReader();
	reader.onload = function (e) {
		const content = e.target.result;
		// Now you can work with the content of the file
		console.log(content);
		const rows = content.split('\r\n');
		let i = 1
		let totale = 0
		for (let index = 0; index < rows.length - 1; index++) {
			const row = rows
			const col = row[index].replaceAll('\"', '').split('\t')
			console.log(col)
			totale += parseFloat(col[6].replace(",", "."))
		}

		let xml = `<?xml version="1.0" encoding="UTF-8"?>
	<CBISDDReqLogMsg xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:CBI:xsd:CBISDDReqLogMsg.00.01.01">
		<GrpHdr>
			<MsgId>0000010000001</MsgId>
			<CreDtTm>`+ isoDateTime + `</CreDtTm>
			<NbOfTxs>`+ (rows.length - 1) + `</NbOfTxs>
			<CtrlSum>`+ totale.toFixed(2) + `</CtrlSum>
			<InitgPty>
				<Nm>MEDIAPRINT S.R.L.</Nm>
				<Id>
					<OrgId>
						<Othr>
							<Id>GEBQ7868</Id>
							<Issr>CBI</Issr>
						</Othr>
					</OrgId>
				</Id>
			</InitgPty>
		</GrpHdr>
	`
		for (let index = 0; index < rows.length - 1; index++) {
			const row = rows
			const col = row[index].replaceAll('\"', '').split('\t')
			console.log(col)
			data = col[7].split("-")
			ReqdColltnDt = data[2] + "-" + data[1] + "-" + data[0]

			data = col[13].split("/")
			DtOfSgntr = data[2] + "-" + data[1] + "-" + data[0]
			xml += `		<PmtInf>
			<PmtInfId>`+ i + `</PmtInfId>
			<PmtMtd>DD</PmtMtd>
			<PmtTpInf>
				<SvcLvl>
					<Cd>SEPA</Cd>
				</SvcLvl>
				<LclInstrm>
					<Cd>B2B</Cd>
				</LclInstrm>
				<SeqTp>RCUR</SeqTp>
			</PmtTpInf>
			<ReqdColltnDt>`+ ReqdColltnDt + `</ReqdColltnDt>
			<Cdtr>
				<Nm>MEDIAPRINT S.R.L.</Nm>
				<PstlAdr>
					<StrtNm>C.DA VIBRATA</StrtNm>
					<PstCd>64015</PstCd>
					<TwnNm>NERETO</TwnNm>
					<CtrySubDvsn>TE</CtrySubDvsn>
					<Ctry>IT</Ctry>
				</PstlAdr>
			</Cdtr>
			<CdtrAcct>
				<Id>
					<IBAN>IT32N0200824404000040072358</IBAN>
				</Id>
			</CdtrAcct>
			<CdtrAgt>
				<FinInstnId>
					<ClrSysMmbId>
						<MmbId>02008</MmbId>
					</ClrSysMmbId>
				</FinInstnId>
			</CdtrAgt>
			<CdtrSchmeId>
				<Nm>MEDIAPRINT S.R.L.</Nm>
				<Id>
					<PrvtId>
						<Othr>
							<Id>ZZZ</Id>
						</Othr>
					</PrvtId>
				</Id>
			</CdtrSchmeId>
			<DrctDbtTxInf>
				<PmtId>
					<InstrId>`+ (new Date().toISOString() + Math.floor(Math.random() * 100) + 1) + `</InstrId>
					<EndToEndId>`+ (new Date().toISOString() + Math.floor(Math.random() * 100) + 1) + `</EndToEndId>
				</PmtId>
				<InstdAmt Ccy="EUR">`+ col[6].replace(',', '.').trim() + `</InstdAmt>
				<DrctDbtTx>
					<MndtRltdInf>
						<MndtId>`+ col[12].trim() + `</MndtId>
						<DtOfSgntr>`+ DtOfSgntr + `</DtOfSgntr>
					</MndtRltdInf>
				</DrctDbtTx>
				<Dbtr>
					<Nm>`+ col[0].trim().replaceAll('&', '') + `</Nm>
					<PstlAdr>
						<StrtNm>`+ col[1].trim().toUpperCase() + `</StrtNm>
						<PstCd>`+ col[2].trim().toUpperCase() + `</PstCd>
						<TwnNm>`+ col[3].trim().toUpperCase() + `</TwnNm>
						<CtrySubDvsn>`+ col[4].trim().toUpperCase() + `</CtrySubDvsn>
						<Ctry>IT</Ctry>
					</PstlAdr>
				</Dbtr>
				<DbtrAcct>
					<Id>
						<IBAN>`+ col[9].trim().replaceAll(' ', "") + `</IBAN>
					</Id>
				</DbtrAcct>
				<RmtInf>
					<Ustrd>`+ col[8] + `</Ustrd>
				</RmtInf>
			</DrctDbtTxInf>
		</PmtInf>`
			i++;
		}

		xml += `</CBISDDReqLogMsg>`


		fs.writeFile(desktopDir + "/" + (Date.now()) + "000000000001.xml", xml, (err) => {
			if (err) {
				console.error(err);
			} else {
				console.log('File written successfully');
				document.getElementById('result').innerHTML = 'File Creato sul Desktop!'
			}
		})
	};

	reader.onerror = function (e) {
		console.error('Error reading the file', e);
	};

	// Read the file as text
	reader.readAsText(file);
})



