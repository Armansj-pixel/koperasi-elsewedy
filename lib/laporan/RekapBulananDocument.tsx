import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { RekapBulanan } from '@/lib/laporan/actions'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#0f2d6b',
  },
  orgName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
  },
  orgSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  docTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  docMeta: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0f2d6b',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    padding: 6,
    color: '#1e293b',
  },
  tableCellRight: {
    fontSize: 8,
    padding: 6,
    color: '#1e293b',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderTopWidth: 2,
    borderTopColor: '#0f2d6b',
  },
  totalCell: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    padding: 7,
    color: '#0f2d6b',
  },
  totalCellRight: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    padding: 7,
    color: '#0f2d6b',
    textAlign: 'right',
  },
  colNo: { width: '5%' },
  colNik: { width: '13%' },
  colNama: { width: '27%' },
  colWajib: { width: '15%' },
  colSukarela: { width: '15%' },
  colCicilan: { width: '15%' },
  colTotal: { width: '15%' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
  },
  signatureSection: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBox: {
    width: 180,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 40,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
})

function formatRupiah(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export default function RekapBulananDocument({ rekap }: { rekap: RekapBulanan }) {
  const ROWS_PER_PAGE = 28
  const pages: typeof rekap.baris[] = []
  for (let i = 0; i < rekap.baris.length; i += ROWS_PER_PAGE) {
    pages.push(rekap.baris.slice(i, i + ROWS_PER_PAGE))
  }
  if (pages.length === 0) pages.push([])

  return (
    <Document
      title={`Laporan Rekap Potongan Gaji - ${rekap.periodeLabel}`}
      author="Koperasi Karyawan PT Elsewedy Electric Indonesia"
    >
      {pages.map((pageRows, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap>
          {pageIndex === 0 && (
            <>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.orgName}>Koperasi Karyawan PT Elsewedy Electric Indonesia</Text>
                  <Text style={styles.orgSub}>Laporan Rekap Potongan Gaji untuk HR / Finance</Text>
                </View>
                <View>
                  <Text style={styles.docTitle}>Periode: {rekap.periodeLabel}</Text>
                  <Text style={styles.docMeta}>
                    Dicetak: {new Date(rekap.tanggalCetak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.docMeta}>Jumlah Anggota: {rekap.jumlahAnggota}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Simpanan Wajib</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(rekap.totalSimpananWajib)}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Simpanan Sukarela</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(rekap.totalSimpananSukarela)}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Cicilan Pinjaman</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(rekap.totalCicilanPinjaman)}</Text>
                </View>
                <View style={[styles.summaryBox, { backgroundColor: '#dbeafe', borderColor: '#93c5fd' }]}>
                  <Text style={styles.summaryLabel}>Total Potongan</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(rekap.totalKeseluruhan)}</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.table}>
            {/* Header tabel */}
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
              <Text style={[styles.tableHeaderCell, styles.colNik]}>NIK</Text>
              <Text style={[styles.tableHeaderCell, styles.colNama]}>Nama Anggota</Text>
              <Text style={[styles.tableHeaderCell, styles.colWajib, { textAlign: 'right' }]}>Simp. Wajib</Text>
              <Text style={[styles.tableHeaderCell, styles.colSukarela, { textAlign: 'right' }]}>Simp. Sukarela</Text>
              <Text style={[styles.tableHeaderCell, styles.colCicilan, { textAlign: 'right' }]}>Cicilan Pinjaman</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal, { textAlign: 'right' }]}>Total Potongan</Text>
            </View>

            {/* Render baris data */}
            {pageRows.map((row, idx) => {
              const globalIdx = pageIndex * ROWS_PER_PAGE + idx
              return (
                <View
                  key={row.user_id}
                  // PENYESUAIAN STYLING: Gunakan ternary sederhana (aman untuk React-PDF)
                  style={[styles.tableRow, globalIdx % 2 === 1 ? styles.tableRowEven : {}]}
                >
                  <Text style={[styles.tableCell, styles.colNo]}>{globalIdx + 1}</Text>
                  <Text style={[styles.tableCell, styles.colNik]}>{row.nik}</Text>
                  <Text style={[styles.tableCell, styles.colNama]}>{row.nama}</Text>
                  <Text style={[styles.tableCellRight, styles.colWajib]}>{formatRupiah(row.simpanan_wajib)}</Text>
                  <Text style={[styles.tableCellRight, styles.colSukarela]}>{formatRupiah(row.simpanan_sukarela)}</Text>
                  <Text style={[styles.tableCellRight, styles.colCicilan]}>{formatRupiah(row.cicilan_pinjaman)}</Text>
                  <Text style={[styles.tableCellRight, styles.colTotal]}>{formatRupiah(row.total_potongan)}</Text>
                </View>
              )
            })}

            {/* Grand total di halaman terakhir */}
            {pageIndex === pages.length - 1 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalCell, { width: '45%' }]}>TOTAL KESELURUHAN</Text>
                <Text style={[styles.totalCellRight, styles.colWajib]}>{formatRupiah(rekap.totalSimpananWajib)}</Text>
                <Text style={[styles.totalCellRight, styles.colSukarela]}>{formatRupiah(rekap.totalSimpananSukarela)}</Text>
                <Text style={[styles.totalCellRight, styles.colCicilan]}>{formatRupiah(rekap.totalCicilanPinjaman)}</Text>
                <Text style={[styles.totalCellRight, styles.colTotal]}>{formatRupiah(rekap.totalKeseluruhan)}</Text>
              </View>
            )}
          </View>

          {/* Tanda tangan di halaman terakhir */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>Disetujui oleh,</Text>
                <Text style={styles.signatureLine}>Bendahara Koperasi</Text>
              </View>
            </View>
          )}

          {/* Footer page number */}
          <View style={styles.footer} fixed>
            <Text>Koperasi Karyawan PT Elsewedy Electric Indonesia</Text>
            <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  )
}
