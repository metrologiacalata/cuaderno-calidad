/**
 * CUADERNO DE REGISTRO CALIDAD — Google Apps Script
 * --------------------------------------------------
 * Hojas que usa (se crean solas la primera vez):
 *   - Registros : una fila por entrada (fecha + turno agrupan como en la app original)
 *   - Tecnicos  : columna A = nombre del técnico
 *   - Maquinas  : columna A = máquina, columna B = referencias separadas por coma
 *   - Motivos   : columna A = motivo de incidencia
 * Carpeta de Drive "Cuaderno Calidad" con subcarpetas Fotos y Firmas.
 */

const APP_TITLE = 'Cuaderno de Registro Calidad';
const SHEET_REG = 'Registros';
const SHEET_TEC = 'Tecnicos';
const SHEET_MAQ = 'Maquinas';
const SHEET_MOT = 'Motivos';
const ROOT_FOLDER_NAME = 'Cuaderno Calidad';
const DEFAULT_DELETE_PASSWORD = 'Sigit2020'; // cámbiala en Propiedades del script: DELETE_PASSWORD

const REG_HEADERS = ['ID', 'Fecha', 'Turno', 'Tecnico', 'Maquina', 'Referencia',
  'Observaciones', 'FotosIds', 'FirmaId', 'CreadoEn', 'Usuario', 'Motivo'];
const COL = { ID: 0, FECHA: 1, TURNO: 2, TECNICO: 3, MAQUINA: 4, REFERENCIA: 5,
  OBS: 6, FOTOS: 7, FIRMA: 8, CREADO: 9, USUARIO: 10, MOTIVO: 11 };

/* ============ DATOS INICIALES (se copian a las hojas en el primer arranque) ============ */
const SEED = {
  motivos: ["Rebaba", "Rechupe", "Pieza incompleta", "Quemadura", "Raya / arañazo", "Mancha / contaminación",
    "Deformación", "Burbujas", "Líneas de unión", "Marca de inyección", "Fuera de cota",
    "Ajuste de parámetros", "Cambio de molde", "Avería máquina", "OTRO"],
  nombres: ["Jose_Manuel_Lajusticia", "Elena_Tomas", "Sonia_Lafuente", "Rosa_Manez", "Sonia_Molina", "Ana_Serrano", "Paula_Villa", "Natalia_Pinilla", "Enrique_Garcia", "Juan_Antonio_Blana"],
  referenciasPorMaquina: {
    "PR01": ["OTRA", "TAPA_MFK_VW_TS4", "TAPA_MFK_VW_82V", "TAPA_MFK_380", "TAPA_MFK_316", "SOPORTE_DOBLE_PISO_270", "CAJON_GUANTERA", "SOPORTE_DOBLE_PISO_216"],
    "PR02": ["OTRA", "DEFROST_GI", "DEFROST_GD", "DIFUSOR_CENTRAL", "GRIFF_HV_9B9", "GRIFF_HV_82V", "GRIFF_HV_NATURAL", "GRIFF_HV_4PK", "ZONA_CAMBIO_276"],
    "PR03": ["OTRA", "PILAR_A_SUP_GA_IZQ_4PK", "PILAR_A_SUP_GA_DCHA_4PK", "PILAR_A_SUP_DCHA_BASICO_380_4PK", "PILAR_A_SUP_IZQ_BASICO_380_4PK", "PILAR_A_SUP_316_IZQ_BASICO_4PK", "PILAR_A_SUP_316_DCHA_BASICO_4PK", "PILAR_A_SUP_IZQ_BASICO_RM5", "PILAR_A_SUP_DCHA_BASICO_RM5", "PILAR_A_SUP_GA_G_DCHA_RM5_Ssound", "PILAR_A_SUP_GA_G_IZQ_RM5_Ssound", "PILAR_A_SUP_GA_G_DCHA_4PK_Ssound", "PILAR_A_SUP_GA_G_IZQ_4PK_Ssound", "LADEKANTE_380"],
    "PR04": ["OTRA", "SOPORTE_BANDEJA_316", "SOPORTE_BANDEJA_380", "PILAR_CD_380_4PK", "PILAR_CD_316", "PILAR_CD_380_RM5", "LADEKANTE_316", "LADEKANTE_380"],
    "PR05": ["OTRA", "STAFFA_CENTRAL", "STAFFA_ANTERIOR_GSX", "REAR_BRACKET", "GRIFF_HV_9B9", "GRIFF_HV_82V", "GRIFF_HV_NATURAL", "GRIFF_HV_4PK", "PILAR_C_RM5", "PILAR_C_4PK", "ZONA_CAMBIO_276", "CAJA_CAMBIOS_270", "TAPA_MFK_380", "CENTRAL_BRACKET"],
    "PR06": ["OTRA", "GRIFF_HV_9B9", "GRIFF_HV_82V", "GRIFF_HV_NATURAL", "GRIFF_HV_4PK", "CAJA_CAMBIOS_270", "CENTRAL_BRACKET", "PILAR_D_RM5", "PILAR_D_4PK"],
    "PR07": ["OTRA", "STAFFA_ANTERIOR_GSX", "STAFFA_POSTERIOR", "STAFFA_CENTRAL", "REAR_BRACKET", "RADSPOILER_216", "RADSPOILER_270"],
    "PR08": ["OTRA", "GRIFF_LV", "RESBALON_GD", "RESBALON_GI", "RUEDA"],
    "PR09": ["OTRA", "MITTELLAGER_82V", "MITTELLAGER_4PK", "STAFFA_ANTERIOR_GDX", "SOPORTE_TWEETER_380", "RUEDA", "TAPA_LADEKANTE", "TAPA_TECHO_VW_216_82V", "TAPA_TECHO_VW_216_TS4", "RESBALON_GI", "RESBALON_GD", "SOPORTE_TWEETER_316"],
    "PR11": ["OTRA", "REAR_BRACKET", "STAFFA_POSTERIOR", "SOPORTE_DOBLE_PISO_270", "SOPORTE_DOBLE_PISO_216", "CAJON_GUANTERA", "TAPA_RELE_GD_SIN_AIRBAG", "TAPA_RELE_GD_CON_AIRBAG", "TAPA_RELE_GI_SIN_AIRBAG", "TAPA_RELE_GI_CON_AIRBAG", "TAPA_MFK_316", "TAPA_MFK_380", "TAPA_MFK_VW_82V", "TAPA_MFK_VW_ST4"],
    "PR12": ["OTRA", "TAPA_RELE_GI_SIN_AIRBAG", "TAPA_RELE_GI_CON_AIRBAG", "TAPA_LATERAL_GI", "TAPA_LATERAL_GD", "CAJON_GUANTERA_GAGI"],
    "PR13": ["OTRA", "SOPORTE_MANECILLA_GI", "SOPORTE_MANECILLA_GD", "BRAZOS", "MANECILLA_GI", "MANECILLA_GD"],
    "PR14": ["OTRA", "MARCO_LATERAL_380", "MARCO_LATERAL_382", "MARCO_LATERAL_316"],
    "PR15": ["OTRA", "MARCO_LATERAL_382", "MARCO_LATERAL_316", "MARCO_LATERAL_380", "PILAR_A_INFERIOR", "LADEKANTE_380", "LADEKANTE_316", "LADEKANTE_382", "PILAR_A_SUP_GA_IZQ_4PK", "PILAR_A_SUP_GA_DCHA_4PK", "PILAR_A_SUP_DCHA_BASICO_380_4PK", "PILAR_A_SUP_IZQ_BASICO_380_4PK", "PILAR_A_SUP_316_IZQ_BASICO_4PK", "PILAR_A_SUP_316_DCHA_BASICO_4PK", "PILAR_A_SUP_IZQ_BASICO_RM5", "PILAR_A_SUP_DCHA_BASICO_RM5", "PILAR_A_SUP_GA_G_DCHA_RM5_Ssound", "PILAR_A_SUP_GA_G_IZQ_RM5_Ssound", "PILAR_A_SUP_GA_G_DCHA_4PK_Ssound", "PILAR_A_SUP_GA_G_IZQ_4PK_Ssound"],
    "PR16": ["OTRA", "LADEKANTE_382", "PILAR_B_INFERIOR"],
    "PR17": ["OTRA", "PILAR_D_4PK", "PILAR_D_RM5", "PILAR_C_RM5", "PILAR_C_4PK", "PILAR_B_SUPERIOR_316", "PILAR_B_SUPERIOR_380_4PK", "PILAR_B_SUPERIOR_380_RM5", "MARCO_PORTON_SUP_380", "MARCO_PORTON_SUP_382", "MARCO_PORTON_SUP_316"],
    "PR18": ["OTRA", "MARCO_PORTON_SUP_380", "MARCO_PORTON_SUP_382", "MARCO_PORTON_SUP_316", "CAJON_GUANTERA_GBGI"],
    "PR19": ["OTRA", "PASORUEDA", "PORTON_INFERIOR_316", "PORTON_INFERIOR_380", "PORTON_INFERIOR_382", "SOPORTE_BANDEJA_382", "FRONT_SEAT", "FRONT_SK", "PORTON_INF_382_TROQUELADO", "PORTON_INF_316_TROQUELADO"],
    "PR20": ["OTRA", "ESTRIBERA", "ESTRIBERA_2020", "PASORUEDA", "PILAR_A_INFERIOR"],
    "PR21": ["OTRA", "PILAR_CD_316_4PK", "PASORUEDA", "ESTRIBERA", "ESTRIBERA_2020", "LADEKANTE_316", "PORTON_INFERIOR_380", "PORTON_INFERIOR_316", "REAR_SEAT", "REAR_SK"],
    "PR22": ["OTRA", "PASORUEDA", "REAR_SEAT", "REAR_SK"],
    "PR23": ["OTRA", "PASORUEDA", "TAPA_CONTRATAPA_GI", "TAPA_CONTRATAPA_GD"],
    "PR24": ["OTRA", "LADEKANTE_380", "MARCO_GUANTERA_GAGI", "MARCO_GUANTERA_GAGD", "PILAR_CD_380_4PK", "PILAR_CD_380_RM5"],
    "PR25": ["OTRA"],
    "KUKA": ["OTRA", "LADEKANTE_380", "LADEKANTE_316", "LADEKANTE_382"],
    "RAMPF": ["OTRA", "FRONT_SEAT", "REAR_SEAT", "FRONT_SK", "REAR_SK"]
  }
};

/* ============================== WEB APP (API) ==============================
 * La interfaz (index.html) se aloja fuera de Google para poder usar cámara y micrófono.
 * Esta parte solo recibe peticiones y guarda/lee en Sheets y Drive.
 * Acceso abierto: cualquiera con el enlace de la app puede usarla.
 */
function doGet() {
  return json_({ ok: true, app: APP_TITLE });
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const API = {
      getConfig: apiGetConfig,
      list: apiListRegistros,
      get: apiGetRegistro,
      guardar: apiGuardar,
      updateObs: apiUpdateObs,
      borrar: apiDeleteRegistro
    };
    const fn = API[req.action];
    if (!fn) throw new Error('Acción desconocida: ' + req.action);
    out = { ok: true, data: fn.apply(null, req.args || []) };
  } catch (err) {
    out = { ok: false, error: err && err.message ? err.message : String(err) };
  }
  return json_(out);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ============================== INFRAESTRUCTURA ============================== */
function props_() { return PropertiesService.getScriptProperties(); }

function getSS_() {
  const p = props_();
  const id = p.getProperty('SS_ID');
  if (id) return SpreadsheetApp.openById(id);
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) ss = SpreadsheetApp.create(APP_TITLE);
  p.setProperty('SS_ID', ss.getId());
  return ss;
}

function getSheet_(name) {
  const ss = getSS_();
  let sh = ss.getSheetByName(name);
  if (sh) return sh;

  sh = ss.insertSheet(name);
  if (name === SHEET_REG) {
    sh.getRange(1, 1, 1, REG_HEADERS.length).setValues([REG_HEADERS]).setFontWeight('bold').setBackground('#A9D18E');
    sh.setFrozenRows(1);
    sh.getRange('B:B').setNumberFormat('@'); // fecha como texto yyyy-MM-dd
  } else if (name === SHEET_TEC) {
    sh.getRange(1, 1).setValue('Tecnico').setFontWeight('bold').setBackground('#A9D18E');
    sh.getRange(2, 1, SEED.nombres.length, 1).setValues(SEED.nombres.map(n => [n]));
    sh.setFrozenRows(1);
  } else if (name === SHEET_MAQ) {
    sh.getRange(1, 1, 1, 2).setValues([['Maquina', 'Referencias (separadas por coma)']]).setFontWeight('bold').setBackground('#A9D18E');
    const rows = Object.keys(SEED.referenciasPorMaquina).map(m => [m, SEED.referenciasPorMaquina[m].join(', ')]);
    sh.getRange(2, 1, rows.length, 2).setValues(rows);
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 700);
  } else if (name === SHEET_MOT) {
    sh.getRange(1, 1).setValue('Motivo').setFontWeight('bold').setBackground('#A9D18E');
    sh.getRange(2, 1, SEED.motivos.length, 1).setValues(SEED.motivos.map(m => [m]));
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 260);
  }
  return sh;
}

function getFolder_(sub) {
  const p = props_();
  const key = 'FOLDER_' + (sub || 'ROOT');
  const id = p.getProperty(key);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* recrear */ }
  }
  let folder;
  if (!sub) {
    folder = DriveApp.createFolder(ROOT_FOLDER_NAME);
  } else {
    folder = getFolder_(null).createFolder(sub);
  }
  p.setProperty(key, folder.getId());
  return folder;
}

/** Ejecuta esto UNA vez desde el editor para crear hojas y carpetas y conceder permisos. */
function setup() {
  getSheet_(SHEET_REG);
  getSheet_(SHEET_TEC);
  getSheet_(SHEET_MAQ);
  getSheet_(SHEET_MOT);
  getFolder_('Fotos'); getFolder_('Firmas');
  if (!props_().getProperty('DELETE_PASSWORD')) props_().setProperty('DELETE_PASSWORD', DEFAULT_DELETE_PASSWORD);
  // Limpieza de versiones anteriores (clave compartida y sesiones de Google)
  const p = props_();
  Object.keys(p.getProperties()).forEach(k => { if (k === 'API_TOKEN' || k.indexOf('S_') === 0) p.deleteProperty(k); });
  Logger.log('Hoja: ' + getSS_().getUrl());
  Logger.log('Carpeta: ' + getFolder_(null).getUrl());
}

function fmtFecha_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v || '');
}

function readRegRows_() {
  const sh = getSheet_(SHEET_REG);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const values = sh.getRange(2, 1, last - 1, REG_HEADERS.length).getValues();
  return values.map((r, i) => ({
    row: i + 2,
    id: String(r[COL.ID]),
    fecha: fmtFecha_(r[COL.FECHA]),
    turno: String(r[COL.TURNO] || ''),
    nombre: String(r[COL.TECNICO] || ''),
    maquina: String(r[COL.MAQUINA] || ''),
    referencia: String(r[COL.REFERENCIA] || ''),
    observaciones: String(r[COL.OBS] || ''),
    fotosIds: String(r[COL.FOTOS] || '').split(',').map(s => s.trim()).filter(Boolean),
    firmaId: String(r[COL.FIRMA] || ''),
    createdAt: r[COL.CREADO] instanceof Date ? r[COL.CREADO].toISOString() : String(r[COL.CREADO] || ''),
    usuario: String(r[COL.USUARIO] || ''),
    motivo: String(r[COL.MOTIVO] || '').trim()
  })).filter(e => e.id);
}

function dataUrlToBlob_(dataUrl, name) {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
  if (!m) throw new Error('Imagen no válida');
  return Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name);
}

function blobToDataUrl_(blob) {
  return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

/* ============================== API (llamadas desde el cliente) ============================== */

/** Listas para los desplegables. */
function apiGetConfig() {
  const tec = getSheet_(SHEET_TEC);
  const maq = getSheet_(SHEET_MAQ);

  const nombres = tec.getLastRow() > 1
    ? tec.getRange(2, 1, tec.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim()).filter(Boolean)
    : [];

  const referenciasPorMaquina = {};
  const maquinas = [];
  if (maq.getLastRow() > 1) {
    maq.getRange(2, 1, maq.getLastRow() - 1, 2).getValues().forEach(r => {
      const m = String(r[0]).trim();
      if (!m) return;
      maquinas.push(m);
      referenciasPorMaquina[m] = Array.from(new Set(String(r[1] || '').split(',').map(s => s.trim()).filter(Boolean)));
    });
  }

  const mot = getSheet_(SHEET_MOT);
  const motivos = mot.getLastRow() > 1
    ? mot.getRange(2, 1, mot.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim()).filter(Boolean)
    : [];

  return { nombres, maquinas, referenciasPorMaquina, motivos };
}

/** Lista agrupada por fecha + turno (igual que los "registros" de la app original). Sin imágenes. */
function apiListRegistros() {
  const rows = readRegRows_();
  const groups = {};
  rows.forEach(e => {
    const key = e.fecha + '|' + e.turno;
    if (!groups[key]) groups[key] = { key, fecha: e.fecha, turno: e.turno, entries: [] };
    groups[key].entries.push({
      id: e.id, nombre: e.nombre, maquina: e.maquina, referencia: e.referencia,
      motivo: e.motivo, createdAt: e.createdAt, nFotos: e.fotosIds.length
    });
  });
  return Object.keys(groups).map(k => groups[k]);
}

/** Detalle de un grupo con fotos y firmas en base64 (para no depender de permisos de Drive). */
function apiGetRegistro(fecha, turno) {
  const rows = readRegRows_().filter(e => e.fecha === fecha && e.turno === turno);
  const entries = rows.map(e => {
    const fotos = e.fotosIds.map(id => {
      try {
        const f = DriveApp.getFileById(id);
        return { name: f.getName(), dataUrl: blobToDataUrl_(f.getBlob()), url: f.getUrl() };
      } catch (err) { return null; }
    }).filter(Boolean);

    let firma = '';
    if (e.firmaId) {
      try { firma = blobToDataUrl_(DriveApp.getFileById(e.firmaId).getBlob()); } catch (err) {}
    }
    return {
      id: e.id, nombre: e.nombre, maquina: e.maquina, referencia: e.referencia, motivo: e.motivo,
      observaciones: e.observaciones, createdAt: e.createdAt, usuario: e.usuario,
      fotos, firma
    };
  });
  return { fecha, turno, entries };
}

/** Guarda una entrada. Las fotos y la firma van a Drive; en la hoja queda el ID del archivo. */
function apiGuardar(payload) {
  const p = payload || {};
  ['fecha', 'nombre', 'turno', 'maquina', 'referencia', 'motivo'].forEach(k => {
    if (!p[k]) throw new Error('Falta el campo: ' + k);
  });
  if (!p.firma) throw new Error('Falta la firma.');

  const id = Utilities.getUuid();
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const base = `${p.fecha}_${p.turno}_${p.maquina}_${stamp}`;

  const fotosFolder = getFolder_('Fotos');
  const fotosIds = (p.fotos || []).map((f, i) => {
    const blob = dataUrlToBlob_(f.dataUrl, `${base}_foto${i + 1}.jpg`);
    return fotosFolder.createFile(blob).getId();
  });

  const firmaId = getFolder_('Firmas').createFile(dataUrlToBlob_(p.firma, `${base}_firma.png`)).getId();

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    getSheet_(SHEET_REG).appendRow([
      id, p.fecha, p.turno, p.nombre, p.maquina, p.referencia,
      String(p.observaciones || '').trim(), fotosIds.join(','), firmaId,
      new Date().toISOString(), '', p.motivo
    ]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, id };
}

function apiUpdateObs(id, texto) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const e = readRegRows_().find(x => x.id === String(id));
    if (!e) throw new Error('No se encontró la entrada a editar.');
    getSheet_(SHEET_REG).getRange(e.row, COL.OBS + 1).setValue(String(texto || '').trim());
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function checkPassword_(pass) {
  const real = props_().getProperty('DELETE_PASSWORD') || DEFAULT_DELETE_PASSWORD;
  if (String(pass) !== real) throw new Error('Contraseña incorrecta. No se ha borrado nada.');
}

/** Borra todo el registro (fecha + turno), como en la app original. Las imágenes van a la papelera de Drive. */
function apiDeleteRegistro(fecha, turno, pass) {
  checkPassword_(pass);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_(SHEET_REG);
    const rows = readRegRows_().filter(e => e.fecha === fecha && e.turno === turno);
    rows.sort((a, b) => b.row - a.row).forEach(e => {
      e.fotosIds.concat(e.firmaId ? [e.firmaId] : []).forEach(fid => {
        try { DriveApp.getFileById(fid).setTrashed(true); } catch (err) {}
      });
      sh.deleteRow(e.row);
    });
    return { ok: true, borradas: rows.length };
  } finally {
    lock.releaseLock();
  }
}

/**
 * USO ÚNICO desde el editor: borra TODOS los registros de la hoja y manda
 * sus fotos y firmas a la papelera de Drive (recuperables 30 días).
 * Sirve para empezar de cero. Solo funciona si la ejecuta el propietario del script.
 */
function borrarTodosLosRegistros() {
  const yo = Session.getEffectiveUser().getEmail();
  if (!yo || Session.getActiveUser().getEmail() !== yo) {
    throw new Error('Solo el propietario puede ejecutar esta función desde el editor.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rows = readRegRows_();
    rows.forEach(e => {
      e.fotosIds.concat(e.firmaId ? [e.firmaId] : []).forEach(fid => {
        try { DriveApp.getFileById(fid).setTrashed(true); } catch (err) {}
      });
    });
    const sh = getSheet_(SHEET_REG);
    if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
    Logger.log('Registros borrados: ' + rows.length);
  } finally {
    lock.releaseLock();
  }
}
